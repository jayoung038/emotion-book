import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA6Smrlm7b8bLXcz_d9KWpt-2FpR619Kj8",
  authDomain: "emotion-book-e5c88.firebaseapp.com",
  projectId: "emotion-book-e5c88",
  storageBucket: "emotion-book-e5c88.appspot.com",
  messagingSenderId: "131157202589",
  appId: "1:131157202589:web:c2ffe5e0cbb4bc25ee2674"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);