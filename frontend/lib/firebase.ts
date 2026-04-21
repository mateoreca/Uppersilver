import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAmtRiD_J5Uvl__TtUN3rIQeEDZ4-j-by0",
  authDomain: "project-a50f6246-1ee7-413c-b77.firebaseapp.com",
  projectId: "project-a50f6246-1ee7-413c-b77",
  storageBucket: "project-a50f6246-1ee7-413c-b77.firebasestorage.app",
  messagingSenderId: "1072260475637",
  appId: "1:1072260475637:web:fb0ab239035b40d4fc73bc"
};

// Avoid re-initializing on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
