'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function SimpleAuthTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Testing email signup...');

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setStatus(`✅ Success! Created user: ${result.user.email}`);
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testGoogleSignIn = async () => {
    setLoading(true);
    setStatus('Testing Google sign in...');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setStatus(`✅ Success! Google user: ${result.user.email}`);
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      console.error('Google signin error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Simple Auth Test</h1>
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              ← Back to Home
            </Link>
          </div>

          {status && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{status}</p>
            </div>
          )}

          <form onSubmit={testEmailSignUp} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                placeholder="test@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                placeholder="password123"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Testing...' : 'Test Email Signup'}
            </button>
          </form>

          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={testGoogleSignIn}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Testing...' : 'Test Google Sign In'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/debug-firebase" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View Debug Console →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}