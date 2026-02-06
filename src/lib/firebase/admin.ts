import * as admin from 'firebase-admin';

let adminInitializationError: string | null = null;

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
      const missing = [];
      if (!projectId) missing.push("FIREBASE_PROJECT_ID");
      if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
      if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");
      
      adminInitializationError = `Missing server env vars: ${missing.join(", ")}`;
      console.warn(`Firebase Admin: ${adminInitializationError}`);
    }
  } catch (error: any) {
    adminInitializationError = error.message || "Initialization threw error";
    console.error("Firebase Admin Initialization Failed:", error);
  }
}

export const firebaseAdmin = admin;
export { adminInitializationError };

// Safe export: if initialization failed, accessing auth methods will throw runtime error instead of crash at startup
export const firebaseAuth = admin.apps.length ? admin.auth() : {
  verifyIdToken: async () => { throw new Error(adminInitializationError || "Firebase Admin not initialized correctly"); },
  getUser: async () => { throw new Error(adminInitializationError || "Firebase Admin not initialized correctly"); },
} as unknown as admin.auth.Auth;
