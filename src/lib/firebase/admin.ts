import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      console.warn("Firebase Admin: Missing environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Skipping initialization.");
    }
  } catch (error) {
    console.error("Firebase Admin Initialization Failed:", error);
  }
}

export const firebaseAdmin = admin;
// Safe export: if initialization failed, accessing auth methods will throw runtime error instead of crash at startup
export const firebaseAuth = admin.apps.length ? admin.auth() : {
  verifyIdToken: async () => { throw new Error("Firebase Admin not initialized correctly"); },
  getUser: async () => { throw new Error("Firebase Admin not initialized correctly"); },
} as unknown as admin.auth.Auth;
