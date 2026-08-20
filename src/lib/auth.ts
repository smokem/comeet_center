import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "./firebase";

export type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: User };

/**
 * Subscribes to Firebase Auth state changes.
 * Returns { status: "loading" } until the first auth event fires,
 * then either "authenticated" with the user or "unauthenticated".
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState(user ? { status: "authenticated", user } : { status: "unauthenticated" });
    });
    return unsubscribe;
  }, []);

  return state;
}

/**
 * Sign in with email + password. Throws on invalid credentials.
 */
export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Sign out the current user.
 */
export async function logOut(): Promise<void> {
  await signOut(auth);
}
