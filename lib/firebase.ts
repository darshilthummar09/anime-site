import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Get environment variables
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// Validate that all required configuration values are present
const isFirebaseConfigured = () => {
  return !!(
    apiKey &&
    authDomain &&
    projectId &&
    storageBucket &&
    messagingSenderId &&
    appId &&
    apiKey.length > 10 &&
    !apiKey.includes('your_') &&
    !projectId.includes('your-') &&
    !appId.includes('your_')
  );
};

// Create Firebase configuration object
const firebaseConfig = {
  apiKey: apiKey || '',
  authDomain: authDomain || '',
  projectId: projectId || '',
  storageBucket: storageBucket || '',
  messagingSenderId: messagingSenderId || '',
  appId: appId || '',
};

// Validate configuration before initializing
if (!isFirebaseConfigured()) {
  const missingVars = [];
  if (!apiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!authDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!storageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!messagingSenderId) missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!appId) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  if (typeof window !== 'undefined') {
    console.error('❌ Firebase configuration is missing or invalid!');
    console.error('Required environment variables:');
    console.error('- NEXT_PUBLIC_FIREBASE_API_KEY:', apiKey ? '✓ Set' : '✗ Missing');
    console.error('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', authDomain ? '✓ Set' : '✗ Missing');
    console.error('- NEXT_PUBLIC_FIREBASE_PROJECT_ID:', projectId ? '✓ Set' : '✗ Missing');
    console.error('- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', storageBucket ? '✓ Set' : '✗ Missing');
    console.error('- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', messagingSenderId ? '✓ Set' : '✗ Missing');
    console.error('- NEXT_PUBLIC_FIREBASE_APP_ID:', appId ? '✓ Set' : '✗ Missing');
    console.error('');
    console.error('Missing variables:', missingVars.join(', '));
    console.error('');
    console.error('Please check your .env.local file and ensure all Firebase configuration values are set.');
    console.error('See FIREBASE_SETUP.md for setup instructions.');
    console.error('');
    console.error('⚠️ IMPORTANT: After updating .env.local, you MUST restart your development server:');
    console.error('  1. Stop the server (Ctrl+C)');
    console.error('  2. Run: npm run dev');
  }
  
  // Don't throw error on server-side to allow app to build
  // Error will be caught and displayed in the UI
  if (typeof window !== 'undefined') {
    throw new Error(`Firebase configuration is missing. Missing variables: ${missingVars.join(', ')}. Please check your .env.local file and restart the server.`);
  }
}

// Initialize Firebase
let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { auth, db };
export default app;

