'use client';

import { useAuth } from '@/lib/simple-auth-context';
import LoadingSpinner from '@/components/loading-spinner';
import Link from 'next/link';

export default function TestAuth() {
  const { user, loading, error } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading authentication test..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication Test</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-medium">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">User Authentication Status</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Authenticated:</strong> {user ? '✅ Yes' : '❌ No'}
                </p>
                {user && (
                  <>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>User ID:</strong> {user.uid}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Display Name:</strong> {user.displayName || 'Not set'}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Email Verified:</strong> {user.emailVerified ? '✅ Yes' : '❌ No'}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Firebase Configuration</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Auth Domain:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Environment:</strong> {process.env.NODE_ENV}
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <Link 
                href="/" 
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Back to Home
              </Link>
              {user ? (
                <Link 
                  href="/dashboard" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link 
                  href="/auth/signin" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}