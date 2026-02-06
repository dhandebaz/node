import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize variables to hold the Firebase instances
let app: FirebaseApp | undefined;
let auth: Auth;
let analytics: Analytics | undefined;

// Only execute on the client side
if (typeof window !== "undefined") {
  // Guard against duplicate initialization
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize Analytics conditionally
  isSupported().then((supported) => {
    if (supported && app) {
      analytics = getAnalytics(app);
    }
  });
} else {
    // Server-side: export undefined or safe mocks if strictly necessary.
    // However, since we are using these in Client Components (useEffect), 
    // they should be accessed only on client.
    // To satisfy TypeScript strictness without breaking imports, we can cast.
    // But ideally, consumers should handle undefined. 
    // Given existing code expects 'auth' to be defined, we cast to avoid massive refactor,
    // relying on the fact that server code won't use it.
    auth = undefined as unknown as Auth;
}

export { app, auth, analytics };
