'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  checkPremiumStatus: () => Promise<void>;
  setPremium: (status: boolean) => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userData, refreshUserData, loading: authLoading } = useAuth();

  const checkPremiumStatus = async () => {
    try {
      setIsLoading(true);

      // If user is logged in, check their premium status from Firestore
      if (user && userData) {
        let premiumStatus = userData.isPremium || false;
        
        // Check if premium has expired
        if (premiumStatus && userData.premiumEndDate) {
          const endDate = userData.premiumEndDate.toDate ? userData.premiumEndDate.toDate() : new Date(userData.premiumEndDate);
          const now = new Date();
          
          if (now > endDate) {
            // Premium has expired, update status
            premiumStatus = false;
            // Update Firestore to reflect expired status
            if (user) {
              try {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                  isPremium: false,
                  premiumUpdatedAt: new Date(),
                });
                await refreshUserData();
              } catch (error) {
                console.error('Error updating expired premium status:', error);
              }
            }
          }
        }
        
        setIsPremium(premiumStatus);
        setIsLoading(false);
        return;
      }

      // If no user, check localStorage as fallback (for backward compatibility)
      const storedStatus = localStorage.getItem('premium_status');
      if (storedStatus === 'true') {
        setIsPremium(true);
        setIsLoading(false);
        return;
      }

      // Check session from URL if available (for Stripe redirects)
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      if (sessionId) {
        const response = await fetch(`/api/stripe/subscription-status?session_id=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.isPremium);
          // Update Firestore if user is logged in
          if (user) {
            await updatePremiumStatusInFirestore(data.isPremium);
            await refreshUserData();
          } else {
            localStorage.setItem('premium_status', data.isPremium ? 'true' : 'false');
          }
        }
      }

      setIsPremium(false);
    } catch (error: any) {
      // Ignore abort errors (operations cancelled due to unmount)
      if (error.name === 'AbortError' || 
          error.code === 'cancelled' || 
          error.message?.includes('aborted') ||
          error.message?.includes('AbortError')) {
        return;
      }
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePremiumStatusInFirestore = async (status: boolean) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        isPremium: status,
        premiumUpdatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating premium status in Firestore:', error);
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    if (!authLoading && isMounted) {
      checkPremiumStatus().catch((error) => {
        // Ignore abort errors (component unmounted)
        if (error.name !== 'AbortError' && isMounted) {
          console.error('Error checking premium status:', error);
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, userData, authLoading]);

  const setPremium = async (status: boolean) => {
    try {
      setIsPremium(status);
      
      // Update in Firestore if user is logged in
      if (user) {
        await updatePremiumStatusInFirestore(status);
        await refreshUserData();
      } else {
        // Fallback to localStorage
        localStorage.setItem('premium_status', status ? 'true' : 'false');
      }
    } catch (error) {
      console.error('Error setting premium status:', error);
    }
  };

  return (
    <PremiumContext.Provider value={{ isPremium, isLoading, checkPremiumStatus, setPremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}

