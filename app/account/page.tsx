'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { FiSave, FiAlertCircle } from 'react-icons/fi';

export default function AccountPage() {
  const { user, userData, refreshUserData, loading: authLoading } = useAuth();
  const { isPremium } = usePremium();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (userData) {
      setName(userData.displayName || '');
      setEmail(userData.email || '');
    }
  }, [user, userData, authLoading, router]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update Firebase Auth profile
      if (name !== userData?.displayName && name.trim()) {
        await updateProfile(user, {
          displayName: name.trim(),
        });
      }

      // Update Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: name.trim() || userData?.displayName || null,
        updatedAt: new Date(),
      });

      await refreshUserData();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Account Settings</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded flex items-center space-x-2 text-red-300">
            <FiAlertCircle />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded text-green-300">
            <span className="text-sm">{success}</span>
          </div>
        )}

        <div className="space-y-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-gray-700 border border-gray-700 rounded px-4 py-2 text-gray-400 cursor-not-allowed"
                />
                <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
              </div>
              <button
                onClick={handleSave}
                disabled={loading || name.trim() === (userData?.displayName || '')}
                className="flex items-center space-x-2 bg-netflix-red text-white px-6 py-2 rounded font-semibold hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave size={18} />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Subscription</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {isPremium ? 'Unlimited streaming' : 'Upgrade for unlimited streaming'}
                  </p>
                </div>
                {isPremium ? (
                  <button
                    onClick={() => router.push('/subscription')}
                    className="bg-gray-800 text-white px-6 py-2 rounded font-semibold hover:bg-gray-700 transition"
                  >
                    Manage
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/subscription')}
                    className="bg-netflix-red text-white px-6 py-2 rounded font-semibold hover:bg-opacity-80 transition"
                  >
                    Upgrade to Premium
                  </button>
                )}
              </div>
              {isPremium && userData && (
                <div className="pt-4 border-t border-gray-700 space-y-2">
                  {userData.premiumPurchaseDate && (
                    <div>
                      <p className="text-gray-400 text-sm">Purchase Date</p>
                      <p className="text-white">
                        {userData.premiumPurchaseDate.toDate 
                          ? userData.premiumPurchaseDate.toDate().toLocaleDateString()
                          : new Date(userData.premiumPurchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {userData.premiumEndDate && (
                    <div>
                      <p className="text-gray-400 text-sm">Expires On</p>
                      <p className="text-white">
                        {userData.premiumEndDate.toDate 
                          ? userData.premiumEndDate.toDate().toLocaleDateString()
                          : new Date(userData.premiumEndDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {userData.subscriptionId && (
                    <div>
                      <p className="text-gray-400 text-sm">Subscription ID</p>
                      <p className="text-white text-xs font-mono break-all">{userData.subscriptionId}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Parental Controls</h2>
            <p className="text-gray-400 mb-4">Manage viewing restrictions and content ratings</p>
            <button className="bg-gray-800 text-white px-6 py-2 rounded font-semibold hover:bg-gray-700 transition">
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
