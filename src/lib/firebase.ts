/**
 * firebase.ts
 *
 * Full Firebase SDK — Auth + full Firestore (needed for serverTimestamp and
 * real-time writes). Only imported by /admin and the write paths in
 * settings-api.ts (lazy dynamic import).
 *
 * Public pages use firebase-lite.ts instead, which provides a lighter
 * Firestore Lite instance for one-time reads only.
 */

import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { frontendEnv } from "./env";

const firebaseConfig = {
  ...frontendEnv.firebase,
  apiKey: frontendEnv.firebase.apiKey || "placeholder-api-key-ssr",
};

// Re-use the app already created by firebase-lite.ts if it loaded first,
// so we never call initializeApp twice with the same config.
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0]!;

/** Full Firestore — supports serverTimestamp, transactions, writes. Admin only. */
export const db = getFirestore(app);

/** Firebase Auth — admin login only. */
export const auth = getAuth(app);

export { app };
