/**
 * firebase-lite.ts
 *
 * Initialises the Firebase app (shared singleton) and exports a Firestore
 * **Lite** instance for use on public pages.
 *
 * Firestore Lite (`firebase/firestore/lite`) supports only one-time reads
 * (getDoc / getDocs / query) — no real-time listeners. It is ~50 % smaller
 * than the full SDK and sufficient for every public-facing read in this app.
 *
 * Auth and full Firestore (needed for serverTimestamp + writes) live in
 * firebase.ts and are only imported by /admin routes.
 */

import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

import { frontendEnv } from "./env";

const firebaseConfig = {
  ...frontendEnv.firebase,
  apiKey: frontendEnv.firebase.apiKey || "placeholder-api-key-ssr",
};

// Re-use the app instance if already initialised (e.g. by firebase.ts in admin).
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0]!;

/** Firestore Lite — one-time reads only. Use on all public pages. */
export const dbLite = getFirestore(app);
export { app };
