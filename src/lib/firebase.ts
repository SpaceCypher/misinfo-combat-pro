import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyALyYYmemnXknHVysvPBY1IypKERrFZTzY",
    authDomain: "misinfo-combat-pro.firebaseapp.com",
    projectId: "misinfo-combat-pro",
    storageBucket: "misinfo-combat-pro.firebasestorage.app",
    messagingSenderId: "487353774770",
    appId: "1:487353774770:web:67b1fd0f426ffe19bd8fab",
    measurementId: "G-WNNYHMP3T8"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
