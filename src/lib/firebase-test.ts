import { db } from './firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to read from a test collection (this will create it if it doesn't exist)
    const testCollection = collection(db, 'connection-test');
    const testQuery = query(testCollection, limit(1));
    
    const snapshot = await getDocs(testQuery);
    console.log('✅ Firebase connection successful!');
    console.log('📊 Test collection document count:', snapshot.size);
    
    return { success: true, message: 'Firebase connection working' };
  } catch (error: any) {
    console.error('❌ Firebase connection failed:', error);
    
    return { 
      success: false, 
      message: error.message || 'Unknown Firebase error',
      code: error.code || 'unknown',
      details: error
    };
  }
}

// Auto-test when imported in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    testFirebaseConnection().then(result => {
      if (!result.success) {
        console.warn('🔥 Firebase Test Result:', result);
      }
    });
  }, 2000);
}
