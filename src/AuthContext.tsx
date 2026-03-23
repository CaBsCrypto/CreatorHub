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
        redirectTo: window.location.origin,
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
    // 1. Fetch current session immediately
    const initializeAuth = async () => {
      try {
        console.log("AuthContext: Starting initializeAuth...");
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("AuthContext: getSession completed", { hasSession: !!session, error });
        if (error) throw error;
        handleSession(session);
      } catch (err) {
        console.error("Auth initialization failed:", err);
        setLoading(false); // Stop the spinner even on failure
      }
    };

    initializeAuth();

    // 2. Listen for auth changes
    let subscription: any;
    try {
      console.log("AuthContext: Setting up onAuthStateChange listener...");
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("AuthContext: auth state changed", { event: _event, hasSession: !!session });
        handleSession(session);
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
    console.log("AuthContext: handleSession", { hasUser: !!session?.user });
    if (session?.user) {
      setUser(session.user);
      console.log("AuthContext: fetching profile for user", session.user.id);
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
          console.log("Found pre-existing profile by email, linking to Auth ID...", emailData);
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
            console.log("Successfully linked pre-invited user.");
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
         setProfile(null);
      }
    } catch (err) {
      console.error("Auth context error:", err);
      setProfile(null);
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
