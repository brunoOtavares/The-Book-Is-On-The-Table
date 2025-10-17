import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// NOTE: You need to replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyBDItNkz6EEmbdtHVj4DXlr9YUeFHFlQtk",
  authDomain: "readflow-30d27.firebaseapp.com",
  projectId: "readflow-30d27",
  storageBucket: "readflow-30d27.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;