import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'creator' | 'manager' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }

      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        unsubscribeProfile = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // Ensure the specific user is always an admin
            if (currentUser.email === 'cabscryptocontacto@gmail.com' && data.role !== 'admin') {
              try {
                const { updateDoc } = await import('firebase/firestore');
                await updateDoc(docRef, { role: 'admin' });
                // The snapshot will fire again with the updated data
              } catch (error) {
                console.error("Error updating role to admin:", error);
                setProfile(data); // Fallback to current data if update fails
              }
            } else {
              setProfile(data);
            }
          } else {
            // Document doesn't exist, create it
            try {
              const { setDoc } = await import('firebase/firestore');
              const role = currentUser.email === 'cabscryptocontacto@gmail.com' ? 'admin' : 'creator';
              const userData: any = {
                uid: currentUser.uid,
                email: currentUser.email || '',
                role: role,
                createdAt: new Date().toISOString()
              };
              if (currentUser.displayName) userData.displayName = currentUser.displayName;
              if (currentUser.photoURL) userData.photoURL = currentUser.photoURL;
              
              await setDoc(docRef, userData);
              
              // Notify admin of new creator
              if (role === 'creator') {
                fetch('/api/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    subject: '🚀 Nuevo Creador en CreatorHub',
                    html: `<p>¡Hola! Un nuevo creador se ha unido a la plataforma.</p>
                           <ul>
                             <li><strong>Email:</strong> ${currentUser.email}</li>
                             <li><strong>Nombre:</strong> ${currentUser.displayName || 'N/A'}</li>
                           </ul>`
                  })
                }).catch(err => console.error("Notification failed:", err));
              }
              // The snapshot will fire again with the new data
            } catch (error) {
              console.error("Error creating missing user profile:", error);
              setProfile(null);
            }
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
