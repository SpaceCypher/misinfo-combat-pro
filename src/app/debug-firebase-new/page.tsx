'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/simple-auth-context';
import { testFirebaseConnection } from '@/lib/firebase-test';
import { getUserAnalyses } from '@/lib/analysis-service';

export default function DebugFirebasePage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults(null);

    try {
      console.log('🔧 Running Firebase diagnostics...');
      
      // Test basic connection
      const connectionTest = await testFirebaseConnection();
      
      let dataTest = null;
      if (user) {
        try {
          // Test data access
          console.log('👤 Testing data access for user:', user.uid);
          const analyses = await getUserAnalyses(user.uid, 1);
          dataTest = { 
            success: true, 
            message: `Successfully fetched ${analyses.length} analyses`,
            data: analyses 
          };
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

    } catch (error: any) {
      setTestResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Firebase Debug Console</h1>
          
          <div className="space-y-6">
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
              
              {testResults && (
                <div className="space-y-4">
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Connection Test</h3>
                    <div className={`p-3 rounded ${testResults.connection?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {testResults.connection?.success ? '✅' : '❌'} {testResults.connection?.message}
                    </div>
                  </div>

                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Data Access Test</h3>
                    <div className={`p-3 rounded ${testResults.dataAccess?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {testResults.dataAccess?.success ? '✅' : '❌'} {testResults.dataAccess?.message}
                    </div>
                  </div>

                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Raw Test Results</h3>
                    <pre className="text-xs bg-white p-3 rounded border overflow-auto">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

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
                <pre className="bg-white p-2 rounded text-xs border">
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
