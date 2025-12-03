'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isPremium: boolean;
  premiumPurchaseDate?: any; // Timestamp when premium was purchased
  premiumEndDate?: any; // Timestamp when premium expires
  subscriptionId?: string; // Stripe subscription ID
  createdAt?: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user data from Firestore
  const fetchUserData = async (firebaseUser: User): Promise<UserData | null> => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || data.displayName || null,
          photoURL: firebaseUser.photoURL || data.photoURL || null,
          isPremium: data.isPremium || false,
          premiumPurchaseDate: data.premiumPurchaseDate || null,
          premiumEndDate: data.premiumEndDate || null,
          subscriptionId: data.subscriptionId || null,
          createdAt: data.createdAt,
        };
      } else {
        // Create user document if it doesn't exist
        const newUserData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || null,
          photoURL: firebaseUser.photoURL || null,
          isPremium: false,
          createdAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newUserData);
        return newUserData;
      }
    } catch (error: any) {
      // Ignore abort errors (operations cancelled)
      if (error.name === 'AbortError' || 
          error.code === 'cancelled' || 
          error.message?.includes('aborted') ||
          error.message?.includes('AbortError')) {
        return null;
      }
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    if (user) {
      const data = await fetchUserData(user);
      if (data) {
        setUserData(data);
      }
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          if (isMounted) {
            setUser(firebaseUser);
          }
          const data = await fetchUserData(firebaseUser);
          if (isMounted && data) {
            setUserData(data);
          }
        } else {
          if (isMounted) {
            setUser(null);
            setUserData(null);
          }
        }
        if (isMounted) {
          setLoading(false);
        }
      } catch (error: any) {
        // Ignore abort errors (component unmounted during operation)
        if (error.name === 'AbortError' || 
            error.code === 'cancelled' || 
            error.message?.includes('aborted') ||
            error.message?.includes('AbortError')) {
          return;
        }
        console.error('Error in auth state change:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const data = await fetchUserData(userCredential.user);
      if (data) {
        setUserData(data);
      }
      // Wait for auth state to update
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      // Handle specific Firebase errors with better messages
      const errorCode = error.code || '';
      let errorMessage = error.message || 'Failed to sign in';
      
      if (errorCode === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please check your email or sign up.');
      } else if (errorCode === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (errorCode === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email and try again.');
      } else if (errorCode === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else if (errorCode === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.message) {
        throw new Error(error.message);
      }
      
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile with display name
      try {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
      } catch (profileError) {
        console.warn('Failed to update profile, continuing...', profileError);
        // Continue even if profile update fails
      }

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const newUserData: UserData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        photoURL: null,
        isPremium: false,
        createdAt: serverTimestamp(),
      };
      await setDoc(userDocRef, newUserData);
      setUserData(newUserData);
      
      // Wait for auth state to update
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      // Re-throw with better error message
      const errorCode = error.code || '';
      let errorMessage = error.message || 'Failed to sign up';
      
      // Handle specific Firebase errors
      if (errorCode === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in instead.');
      } else if (errorCode === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password.');
      } else if (errorCode === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email and try again.');
      } else if (errorCode === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.message) {
        throw new Error(error.message);
      }
      
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
      router.push('/login');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

