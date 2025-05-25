
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCYhGcQcgkesxtCPfow7NV_wHhcOX6cMpc",
  authDomain: "josna-lgz-sociality.firebaseapp.com",
  projectId: "josna-lgz-sociality",
  storageBucket: "josna-lgz-sociality.firebasestorage.app",
  messagingSenderId: "295397970348",
  appId: "1:295397970348:web:080591e5330959af302a09",
  measurementId: "G-HS3B3LMX72"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
