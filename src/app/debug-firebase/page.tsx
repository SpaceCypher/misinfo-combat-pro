'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Link from 'next/link';

export default function DebugFirebase() {
  const [status, setStatus] = useState('Checking Firebase connection...');
  const [config, setConfig] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    // Check Firebase configuration
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    setConfig(firebaseConfig);

    // Test Firebase services
    const testFirebase = async () => {
      const results: any = {};

      try {
        // Test Auth
        results.auth = {
          status: 'Connected',
          currentUser: auth.currentUser?.email || 'No user signed in',
          config: auth.config
        };
      } catch (error: any) {
        results.auth = {
          status: 'Error',
          error: error.message
        };
      }

      try {
        // Test Firestore
        results.firestore = {
          status: 'Connected',
          app: db.app.name
        };
      } catch (error: any) {
        results.firestore = {
          status: 'Error',
          error: error.message
        };
      }

      setTestResults(results);
      setStatus('Firebase connection test completed');
    };

    testFirebase();
  }, []);

  const testEmailSignUp = async () => {
    try {
      setStatus('Testing email signup...');
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'testpassword123';
      
      const result = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      setStatus(`Email signup successful! User: ${result.user.email}`);
      
      // Clean up - delete the test user
      await result.user.delete();
      setStatus('Email signup test completed successfully');
    } catch (error: any) {
      setStatus(`Email signup failed: ${error.message}`);
      console.error('Email signup error:', error);
    }
  };

  const testGoogleSignIn = async () => {
    try {
      setStatus('Testing Google sign in...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setStatus(`Google sign in successful! User: ${result.user.email}`);
    } catch (error: any) {
      setStatus(`Google sign in failed: ${error.message}`);
      console.error('Google sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Firebase Debug Console</h1>
            <Link 
              href="/" 
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <div className="space-y-8">
            {/* Status */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Status</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{status}</p>
              </div>
            </div>

            {/* Environment Variables */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Environment Variables</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {config && Object.entries(config).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className={`${value ? 'text-green-600' : 'text-red-600'}`}>
                        {value ? '✅ Set' : '❌ Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Firebase Services Test */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Firebase Services</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            </div>

            {/* Test Buttons */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Manual Tests</h2>
              <div className="flex space-x-4">
                <button
                  onClick={testEmailSignUp}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Test Email Signup
                </button>
                <button
                  onClick={testGoogleSignIn}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Test Google Sign In
                </button>
              </div>
            </div>

            {/* Raw Config Display */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Raw Configuration</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}