'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Check for redirect parameter
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/');
    } catch (err: any) {
      let errorMessage = err.message || 'Failed to sign in. Please check your credentials.';
      
      // Provide helpful error messages for common errors
      if (errorMessage.includes('configuration-not-found') || errorMessage.includes('auth/configuration-not-found')) {
        errorMessage = 'Firebase is not configured. Please check your .env.local file and ensure all Firebase configuration values are set. See FIREBASE_SETUP.md for instructions.';
      } else if (errorMessage.includes('user-not-found')) {
        errorMessage = 'No account found with this email. Please check your email or sign up.';
      } else if (errorMessage.includes('wrong-password')) {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (errorMessage.includes('invalid-email')) {
        errorMessage = 'Invalid email address. Please check your email and try again.';
      } else if (errorMessage.includes('too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="text-3xl font-bold text-netflix-red mb-8 block text-center">
          AnimeFlix
        </Link>
        <div className="bg-netflix-dark rounded-lg p-8 border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-white">Sign In</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded flex items-center space-x-2 text-red-300">
              <FiAlertCircle />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded px-10 py-3 text-white focus:outline-none focus:border-gray-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded px-10 py-3 text-white focus:outline-none focus:border-gray-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-netflix-red text-white py-3 rounded font-semibold hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-netflix-red hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

