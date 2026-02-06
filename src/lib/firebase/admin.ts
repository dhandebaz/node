import * as admin from 'firebase-admin';
import { createRemoteJWKSet, jwtVerify } from 'jose';

let adminInitializationError: string | null = null;
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

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
      // Only warn, don't error, because we can fallback to public key verification
      console.warn(`Firebase Admin: Service Account not configured (${missing.join(", ")}). Falling back to Public Key verification.`);
    }
  } catch (error: any) {
    adminInitializationError = error.message || "Initialization threw error";
    console.error("Firebase Admin Initialization Failed:", error);
  }
}

export const firebaseAdmin = admin;
export { adminInitializationError };

/**
 * Verifies the Firebase ID token using either Admin SDK (if initialized) or Google's Public Keys (fallback).
 * This allows the app to run without a Service Account (Client Keys only) for simple auth verification.
 */
export async function verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
  // 1. Try Admin SDK first (Best performance & features)
  if (admin.apps.length) {
    return admin.auth().verifyIdToken(token);
  }

  // 2. Fallback to Public Key Verification (Jose)
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    throw new Error("Configuration Error: Missing FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID. Cannot verify token.");
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    // Map Jose payload to Firebase DecodedIdToken shape
    return {
      uid: payload.sub!,
      email: payload.email as string | undefined,
      email_verified: payload.email_verified as boolean | undefined,
      phone_number: payload.phone_number as string | undefined,
      picture: payload.picture as string | undefined,
      name: payload.name as string | undefined,
      iss: payload.iss!,
      aud: payload.aud as string,
      auth_time: payload.auth_time as number,
      user_id: payload.sub!,
      sub: payload.sub!,
      iat: payload.iat!,
      exp: payload.exp!,
      firebase: payload.firebase as any,
    } as admin.auth.DecodedIdToken;
  } catch (error: any) {
    console.error("Token Verification Failed (Public Key Mode):", error);
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

// Legacy/Compat export
export const firebaseAuth = admin.apps.length ? admin.auth() : {
  verifyIdToken: verifyIdToken, // Use our wrapper
  getUser: async () => { throw new Error(adminInitializationError || "Firebase Admin not initialized correctly (Service Account required for getUser)"); },
} as unknown as admin.auth.Auth;
