import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { frontendEnv } from "./env";

// ---------------------------------------------------------------------------
// Firebase initialisation
//
// Guard against empty apiKey during SSR cold starts — if the key is missing
// we still initialise with placeholder values so the module doesn't throw
// at import time. Actual Firestore/Auth calls will fail gracefully inside
// their own try/catch blocks in the loaders.
// ---------------------------------------------------------------------------

const firebaseConfig = {
  ...frontendEnv.firebase,
  // Ensure we never pass an empty string as apiKey — Firebase throws immediately
  apiKey: frontendEnv.firebase.apiKey || "placeholder-api-key-ssr",
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0]!;

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };

