import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";

// Initialise Firebase Admin — credentials are provided automatically
// by the Cloud Functions runtime; no service-account file needed.
initializeApp();

// Import after initializeApp so Firestore can be obtained inside handlers.
import { createApp } from "./app";

const expressApp = createApp();

/**
 * "api" — single HTTPS function that proxies every /api/* request to the
 * Express app.  firebase.json routes /api/** here, and the SPA catches
 * everything else through the "**" rewrite to index.html.
 */
export const api = onRequest(
  {
    region: "europe-west1",
    // Allow unauthenticated invocations; auth is handled inside the app.
    invoker: "public",
    // Keep one instance warm to reduce cold-start latency.
    minInstances: 0,
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  expressApp,
);
