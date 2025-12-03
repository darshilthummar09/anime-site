'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { FiCheckCircle } from 'react-icons/fi';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshUserData } = useAuth();
  const { checkPremiumStatus } = usePremium();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    let abortController: AbortController | null = null;
    let fetchCompleted = false;

    const updatePremiumStatus = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        if (isMounted) {
          setError('No session ID found');
          setLoading(false);
        }
        return;
      }

      if (!user) {
        if (isMounted) {
          setError('Please sign in to complete your subscription setup');
          setLoading(false);
        }
        return;
      }

      try {
        // Create abort controller for fetch request
        abortController = new AbortController();
        
        // First, get subscription details from Stripe
        const statusResponse = await fetch(
          `/api/stripe/subscription-status?session_id=${sessionId}&uid=${user.uid}`,
          { signal: abortController.signal }
        );
        
        fetchCompleted = true; // Mark fetch as completed
        
        if (!isMounted) return; // Component unmounted, don't update state
        
        if (!statusResponse.ok) {
          const errorData = await statusResponse.json();
          throw new Error(errorData.error || 'Failed to get subscription details');
        }

        const subscriptionData = await statusResponse.json();
        
        if (!isMounted) return; // Component unmounted, don't update state
        
        if (!subscriptionData.isPremium) {
          throw new Error('Subscription is not active. Please contact support.');
        }

        // Now update Firestore from client side (with authenticated user context)
        // This works because the user is authenticated on the client side
        try {
          const userDocRef = doc(db, 'users', user.uid);
          
          // Prepare the update data with proper Firestore Timestamps
          const updateData: any = {
            isPremium: subscriptionData.isPremium,
            subscriptionId: subscriptionData.subscriptionId || null,
            premiumUpdatedAt: Timestamp.now(),
          };
          
          // Add dates if they exist (convert to Firestore Timestamps)
          if (subscriptionData.purchaseDate) {
            updateData.premiumPurchaseDate = Timestamp.fromDate(new Date(subscriptionData.purchaseDate));
          }
          if (subscriptionData.endDate) {
            updateData.premiumEndDate = Timestamp.fromDate(new Date(subscriptionData.endDate));
          }
          
          // Update Firestore (this will work because user is authenticated)
          await updateDoc(userDocRef, updateData);
        } catch (firestoreError: any) {
          // Handle Firestore errors separately
          if (!isMounted || firestoreError.name === 'AbortError' || firestoreError.code === 'cancelled') {
            return;
          }
          throw firestoreError;
        }

        if (!isMounted) return; // Component unmounted, don't update state

        // Refresh user data to get updated premium status
        try {
          await refreshUserData();
          await checkPremiumStatus();
        } catch (refreshError: any) {
          // Ignore abort errors during refresh (expected when component unmounts)
          if (
            refreshError.name === 'AbortError' || 
            refreshError.code === 'cancelled' || 
            refreshError.message?.includes('aborted') ||
            !isMounted
          ) {
            return;
          }
          if (isMounted) {
            console.warn('Error refreshing user data:', refreshError);
          }
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        // Don't show error if component unmounted or operation was aborted
        if (!isMounted) return;
        
        // Ignore abort errors silently (expected when component unmounts)
        if (err.name === 'AbortError' || err.code === 'cancelled' || err.message?.includes('aborted')) {
          return;
        }
        
        console.error('Error updating premium status:', err);
        let errorMessage = err.message || 'Failed to update premium status. Please contact support.';
        
        // Provide helpful error messages
        if (errorMessage.includes('permission') || errorMessage.includes('PERMISSION_DENIED')) {
          errorMessage = 'Permission error. Please make sure you are logged in and check Firestore security rules. See FIX_SUBSCRIPTION_PERMISSION_ERROR.md for help.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
        
        if (isMounted) {
          setError(errorMessage);
          setLoading(false);
        }
      }
    };

    updatePremiumStatus();

    // Cleanup function - only abort if fetch hasn't completed
    return () => {
      isMounted = false;
      // Only abort fetch if it hasn't completed yet and controller exists
      if (abortController && !fetchCompleted && !abortController.signal.aborted) {
        try {
          abortController.abort();
        } catch (e) {
          // Silently ignore abort errors in cleanup
        }
      }
    };
  }, [searchParams, user, refreshUserData, checkPremiumStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <Navbar />
        <div className="text-white text-xl">Processing your subscription...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="pt-24 px-4 md:px-12 pb-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2 text-red-300">Error</h2>
              <p className="text-red-200">{error}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/subscription"
                className="bg-netflix-red text-white px-8 py-3 rounded font-semibold hover:bg-opacity-80 transition"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="bg-gray-700 text-white px-8 py-3 rounded font-semibold hover:bg-gray-600 transition"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          <FiCheckCircle className="text-green-500 mx-auto mb-6" size={64} />
          <h1 className="text-4xl font-bold mb-4">Welcome to Premium!</h1>
          <p className="text-gray-400 text-lg mb-8">
            Your subscription is now active. Enjoy unlimited access to all premium content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-netflix-red text-white px-8 py-3 rounded font-semibold hover:bg-opacity-80 transition"
            >
              Start Watching
            </Link>
            <Link
              href="/browse"
              className="bg-gray-700 text-white px-8 py-3 rounded font-semibold hover:bg-gray-600 transition"
            >
              Browse Anime
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

