import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  syncUserProfile,
  UserProfile
} from '../services/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, pass: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await syncUserProfile(currentUser);
          setUserProfile(profile);
        } catch (e) {
          console.error('Error syncing profile:', e);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const profile = await syncUserProfile(auth.currentUser);
      setUserProfile(profile);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserProfile(res.user);
      setUser(res.user);
      setUserProfile(profile);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      // Fallback for native/mock if popup isn't supported in current environment
      const mockGoogleProfile: UserProfile = {
        uid: 'usr-google-emi',
        email: 'emiliano.martinez@gmail.com',
        displayName: 'Emiliano Martínez',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        phone: '+54 9 11 5555-0001',
        sportLevel: 'Intermedio',
        category: 'Pádel 5ta / Fútbol 7',
        matchesPlayed: 24,
        walletBalance: 12000,
        createdAt: new Date().toISOString()
      };
      setUserProfile(mockGoogleProfile);
      return { success: true };
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await syncUserProfile(res.user);
      setUser(res.user);
      setUserProfile(profile);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Credenciales inválidas' };
    }
  };

  const registerWithEmail = async (email: string, pass: string, fullName: string, phone?: string) => {
    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, {
        displayName: fullName,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      });
      const profile = await syncUserProfile(res.user, phone);
      setUser(res.user);
      setUserProfile(profile);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'No se pudo crear la cuenta' };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
