import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from './supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const loginWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      }
    });
    if (error) throw error;
  } catch (error) {
    console.error("Error logging in with Google via Supabase", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error logging out", error);
    throw error;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch current session or handle OAuth callback
    const initializeAuth = async () => {
      try {
        // A. If URL hash contains OAuth tokens (implicit flow)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          try {
            const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            if (accessToken && refreshToken) {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              if (data?.session) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
                await handleSession(data.session);
                return;
              }
            }
          } catch (hashErr) {
            console.error("Failed to parse/set session from URL hash:", hashErr);
          }
        }

        // B. If URL query params contain PKCE code (PKCE flow)
        if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
          try {
            const searchParams = new URLSearchParams(window.location.search);
            const code = searchParams.get('code');
            if (code) {
              const { data, error } = await supabase.auth.exchangeCodeForSession(code);
              if (data?.session) {
                window.history.replaceState(null, '', window.location.pathname);
                await handleSession(data.session);
                return;
              }
            }
          } catch (codeErr) {
            console.error("Failed to exchange PKCE code for session:", codeErr);
          }
        }

        // C. Standard session retrieval from storage
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          await handleSession(session);
        } else {
          await handleSession(null);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        setLoading(false); // Stop the spinner even on failure
      }
    };

    initializeAuth();

    // 2. Listen for auth changes
    let subscription: any;
    try {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          await handleSession(session);
        } else if (_event === 'SIGNED_OUT') {
          await handleSession(null);
        }
      });
      subscription = data.subscription;
    } catch (err) {
      console.error("Auth listener failed:", err);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleSession = async (session: Session | null) => {
    if (session?.user) {
      setLoading(true);
      setUser(session.user);
      await fetchOrCreateProfile(session.user);
    } else {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const fetchOrCreateProfile = async (currentUser: User) => {
    try {
      // 1. Check if profile exists by ID (standard path)
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .is('deleted_at', null)
        .single();

      // 2. If not found by ID, try looking up by email (pre-invited users)
      if (!data && currentUser.email) {
        const { data: emailData } = await supabase
          .from('users')
          .select('*')
          .eq('email', currentUser.email)
          .single();

        if (emailData) {
          // Link this profile to the current Auth ID and update metadata
          const { data: linkedData, error: linkError } = await supabase
            .from('users')
            .update({
              id: currentUser.id, // Update the ID to match Auth ID
              display_name: emailData.display_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null,
              photo_url: emailData.photo_url || currentUser.user_metadata?.avatar_url || null
            })
            .eq('email', currentUser.email)
            .select()
            .single();

          if (!linkError && linkedData) {
            data = linkedData;
          } else {
            console.error("Failed to link user by email:", linkError);
          }
        }
      }

      if (data) {
        // Enforce Admin role based on email dynamically as fallback
        if (currentUser.email === 'cabscryptocontacto@gmail.com' && data.role !== 'admin') {
          const { data: updatedData, error: updateError } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', currentUser.id)
            .select()
            .single();
            
          if (!updateError && updatedData) {
            setProfile(updatedData as UserProfile);
            setLoading(false);
            return;
          }
        }
        
        setProfile(data as UserProfile);
      } else if (error?.code === 'PGRST116' || !data) {
        // Profile doesn't exist at all, create a new one
        const role = currentUser.email === 'cabscryptocontacto@gmail.com' ? 'admin' : 'creator';
        
        const newProfile = {
          id: currentUser.id,
          email: currentUser.email || '',
          display_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null,
          photo_url: currentUser.user_metadata?.avatar_url || null,
          role: role
        };

        const { data: newData, error: insertError } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating new user profile in Supabase:", insertError);
          setProfile(null);
        } else {
          setProfile(newData as UserProfile);
          
          // Notify admin of new creator
          if (role === 'creator') {
            const { data: { session } } = await supabase.auth.getSession();
            fetch('/api/send-email', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
              },
              body: JSON.stringify({
                subject: '🚀 Nuevo Creador en Umbra Creator Hub',
                html: `<p>¡Hola! Un nuevo creador se ha unido a la plataforma.</p>
                        <ul>
                          <li><strong>Email:</strong> ${currentUser.email}</li>
                          <li><strong>Nombre:</strong> ${newProfile.display_name || 'N/A'}</li>
                        </ul>`
              })
            }).catch(err => console.error("Notification failed:", err));
          }
        }
      } else {
         console.error("Unexpected error fetching user profile:", error);
         if (currentUser.email === 'cabscryptocontacto@gmail.com') {
           setProfile({
             id: currentUser.id,
             email: currentUser.email,
             display_name: currentUser.user_metadata?.full_name || 'Admin',
             photo_url: currentUser.user_metadata?.avatar_url || null,
             role: 'admin',
             created_at: new Date().toISOString()
           } as UserProfile);
         } else {
           setProfile(null);
         }
      }
    } catch (err) {
      console.error("Auth context error:", err);
      if (currentUser?.email === 'cabscryptocontacto@gmail.com') {
        setProfile({
          id: currentUser.id,
          email: currentUser.email,
          display_name: currentUser.user_metadata?.full_name || 'Admin',
          photo_url: currentUser.user_metadata?.avatar_url || null,
          role: 'admin',
          created_at: new Date().toISOString()
        } as UserProfile);
      } else {
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
