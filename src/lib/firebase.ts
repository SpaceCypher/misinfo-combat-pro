import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - using direct values to ensure they work
const firebaseConfig = {
  apiKey: "AIzaSyALyYYmemnXknHVysvPBY1IypKERrFZTzY",
  authDomain: "misinfo-combat-pro.firebaseapp.com",
  projectId: "misinfo-combat-pro",
  storageBucket: "misinfo-combat-pro.firebasestorage.app",
  messagingSenderId: "487353774770",
  appId: "1:487353774770:web:67b1fd0f426ffe19bd8fab",
  measurementId: "G-WNNYHMP3T8"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
