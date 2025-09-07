'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit 
} from 'firebase/firestore';
import Link from 'next/link';

interface TestResults {
  connection?: {
    success: boolean;
    message: string;
    error?: string;
  };
  dataAccess?: {
    success: boolean;
    message: string;
    data?: any;
    code?: string;
  };
  user?: {
    uid: string;
    email: string | null;
  } | null;
  timestamp?: string;
  error?: string;
}

interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

export default function DebugFirebase() {
  const [status, setStatus] = useState('Checking Firebase connection...');
  const [config, setConfig] = useState<FirebaseConfig | null>(null);
  const [testResults, setTestResults] = useState<TestResults>({});
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Test Firebase connection
  const testFirebaseConnection = async (): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      // Test Firestore connection by writing a test document
      const testDocRef = doc(db, 'connection-test', 'test-' + Date.now());
      await setDoc(testDocRef, {
        timestamp: new Date().toISOString(),
        test: true
      });

      // Try to read it back
      const testDoc = await getDoc(testDocRef);
      
      if (testDoc.exists()) {
        return {
          success: true,
          message: 'Firebase connection successful'
        };
      } else {
        return {
          success: false,
          message: 'Failed to read test document'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Firebase connection failed',
        error: error.message
      };
    }
  };

  // Test user data access
  const testUserDataAccess = async (userId: string) => {
    try {
      const analysesRef = collection(db, 'analyses');
      const q = query(
        analysesRef,
        where('userId', '==', userId),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const analyses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        message: `Successfully fetched ${analyses.length} analyses`,
        data: analyses
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        code: error.code
      };
    }
  };

  // Run comprehensive tests
  const runTests = async () => {
    setLoading(true);
    setTestResults({});
    setStatus('Running Firebase tests...');

    try {
      console.log('🔧 Running Firebase diagnostics...');
      
      // Test basic connection
      const connectionTest = await testFirebaseConnection();
      
      let dataTest = null;
      if (user) {
        try {
          console.log('👤 Testing data access for user:', user.uid);
          dataTest = await testUserDataAccess(user.uid);
        } catch (error: any) {
          dataTest = { 
            success: false, 
            message: error.message,
            code: error.code 
          };
        }
      } else {
        dataTest = { 
          success: false, 
          message: 'User not authenticated' 
        };
      }

      setTestResults({
        connection: connectionTest,
        dataAccess: dataTest,
        user: user ? { uid: user.uid, email: user.email } : null,
        timestamp: new Date().toISOString()
      });

      setStatus('Tests completed');

    } catch (error: any) {
      setTestResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
      setStatus('Tests failed');
    } finally {
      setLoading(false);
    }
  };

  // Test email signup
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

  // Test Google sign in
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

  // Initialize component
  useEffect(() => {
    // Check Firebase configuration
    const firebaseConfig: FirebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    setConfig(firebaseConfig);

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setStatus(`User authenticated: ${currentUser.email}`);
      } else {
        setStatus('User not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-run tests when user changes
  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Firebase Debug Console</h1>
            <Link 
              href="/" 
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
          
          <div className="space-y-6">
            {/* Current Status */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Status</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{status}</p>
              </div>
            </div>

            {/* Authentication Status */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Authentication Status</h2>
              {user ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">✅ User authenticated: {user.email}</p>
                  <p className="text-green-700 text-sm">UID: {user.uid}</p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">⚠️ User not authenticated</p>
                </div>
              )}
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

            {/* Firebase Connection Tests */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Firebase Connection Tests</h2>
                <button
                  onClick={runTests}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg"
                >
                  {loading ? 'Testing...' : 'Run Tests'}
                </button>
              </div>
              
              {testResults && Object.keys(testResults).length > 0 && (
                <div className="space-y-4">
                  {testResults.connection && (
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Connection Test</h3>
                      <div className={`p-3 rounded ${testResults.connection?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {testResults.connection?.success ? '✅' : '❌'} {testResults.connection?.message}
                        {testResults.connection?.error && (
                          <div className="mt-2 text-sm">Error: {testResults.connection.error}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {testResults.dataAccess && (
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Data Access Test</h3>
                      <div className={`p-3 rounded ${testResults.dataAccess?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {testResults.dataAccess?.success ? '✅' : '❌'} {testResults.dataAccess?.message}
                        {testResults.dataAccess?.code && (
                          <div className="mt-2 text-sm">Code: {testResults.dataAccess.code}</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Raw Test Results</h3>
                    <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Tests */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Manual Tests</h2>
              <div className="flex flex-wrap gap-4">
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

            {/* Troubleshooting Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Troubleshooting Guide</h3>
              <div className="text-blue-800 text-sm space-y-2">
                <p><strong>If you see 400 errors:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Check Firestore Security Rules in Firebase Console</li>
                  <li>Verify the project ID matches your Firebase project</li>
                  <li>Ensure authentication is working properly</li>
                  <li>Check browser console for more detailed error messages</li>
                </ul>
                
                <p className="mt-3"><strong>Suggested Firestore Rules for testing:</strong></p>
                <pre className="bg-white p-2 rounded text-xs border overflow-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /analyses/{document} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    match /connection-test/{document} {
      allow read, write: if request.auth != null;
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}