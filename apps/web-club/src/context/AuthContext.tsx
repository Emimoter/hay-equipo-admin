import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPhoneNumber,
  ConfirmationResult,
  RecaptchaVerifier,
  signOut,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  saveUserProfileFirestore,
  getUserProfileFirestore,
} from '../services/firebase';

export interface ExtendedUserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  padelCategory?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: ExtendedUserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<User>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  registerWithEmail: (email: string, pass: string, displayName: string, phone?: string) => Promise<User>;
  sendPhoneVerification: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  confirmPhoneCode: (confirmation: ConfirmationResult, code: string, displayName?: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfileData: (data: Partial<ExtendedUserProfile>) => Promise<void>;
  isAuthModalOpen: boolean;
  authModalReason: string;
  openAuthModal: (reason?: string, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  onAuthSuccessTrigger: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<ExtendedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal Control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');
  const [pendingSuccessCallback, setPendingSuccessCallback] = useState<(() => void) | null>(null);

  // Sync profile from Firestore or local defaults
  const syncProfile = async (firebaseUser: User) => {
    try {
      const remoteData = await getUserProfileFirestore(firebaseUser.uid);
      const profile: ExtendedUserProfile = {
        uid: firebaseUser.uid,
        name: remoteData?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Jugador',
        email: firebaseUser.email || remoteData?.email || '',
        phone: remoteData?.phone || firebaseUser.phoneNumber || '',
        photoURL: firebaseUser.photoURL || remoteData?.photoURL || '',
        padelCategory: remoteData?.padelCategory || '5ta Categoría',
      };
      setUserProfile(profile);

      // Also persist to localStorage for quick offline recovery
      try {
        localStorage.setItem('hay_equipo_user_profile', JSON.stringify(profile));
      } catch (err) {}
    } catch (e) {
      console.error('Error syncing user profile:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (reason?: string, onSuccess?: () => void) => {
    setAuthModalReason(reason || 'Iniciá sesión o registrate para continuar');
    if (onSuccess) {
      setPendingSuccessCallback(() => onSuccess);
    } else {
      setPendingSuccessCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason('');
  };

  const onAuthSuccessTrigger = () => {
    if (pendingSuccessCallback) {
      const cb = pendingSuccessCallback;
      setPendingSuccessCallback(null);
      cb();
    }
    closeAuthModal();
  };

  const loginWithGoogle = async (): Promise<User> => {
    const cred = await signInWithPopup(auth, googleProvider);
    const u = cred.user;

    await saveUserProfileFirestore(u.uid, {
      name: u.displayName || '',
      email: u.email || '',
      photoURL: u.photoURL || '',
      phone: u.phoneNumber || '',
    });

    await syncProfile(u);
    onAuthSuccessTrigger();
    return u;
  };

  const loginWithEmail = async (email: string, pass: string): Promise<User> => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await syncProfile(cred.user);
    onAuthSuccessTrigger();
    return cred.user;
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    phone: string = ''
  ): Promise<User> => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const u = cred.user;

    if (displayName.trim()) {
      try {
        await updateProfile(u, { displayName: displayName.trim() });
      } catch (err) {
        console.warn('Could not set displayName on user object:', err);
      }
    }

    await saveUserProfileFirestore(u.uid, {
      name: displayName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      padelCategory: '5ta Categoría',
    });

    await syncProfile(u);
    onAuthSuccessTrigger();
    return u;
  };

  const sendPhoneVerification = async (
    phoneNumber: string,
    appVerifier: RecaptchaVerifier
  ): Promise<ConfirmationResult> => {
    return await signInWithPhoneNumber(auth, phoneNumber.trim(), appVerifier);
  };

  const confirmPhoneCode = async (
    confirmation: ConfirmationResult,
    code: string,
    displayName?: string
  ): Promise<User> => {
    const cred = await confirmation.confirm(code.trim());
    const u = cred.user;

    if (displayName?.trim()) {
      try {
        await updateProfile(u, { displayName: displayName.trim() });
      } catch (err) {}
    }

    await saveUserProfileFirestore(u.uid, {
      name: displayName?.trim() || u.phoneNumber || 'Jugador',
      phone: u.phoneNumber || '',
      email: u.email || '',
    });

    await syncProfile(u);
    onAuthSuccessTrigger();
    return u;
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    try {
      localStorage.removeItem('hay_equipo_user_profile');
    } catch (e) {}
  };

  const updateUserProfileData = async (data: Partial<ExtendedUserProfile>): Promise<void> => {
    if (!user) return;
    const updated = {
      ...userProfile,
      ...data,
      uid: user.uid,
    } as ExtendedUserProfile;
    setUserProfile(updated);

    await saveUserProfileFirestore(user.uid, {
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      padelCategory: updated.padelCategory,
    });

    try {
      localStorage.setItem('hay_equipo_user_profile', JSON.stringify(updated));
    } catch (e) {}
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
        sendPhoneVerification,
        confirmPhoneCode,
        logout,
        updateUserProfileData,
        isAuthModalOpen,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        onAuthSuccessTrigger,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
