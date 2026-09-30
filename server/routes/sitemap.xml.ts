/**
 * /sitemap.xml — Nitro server route.
 *
 * Fetches course slugs from Firestore Lite at request time.
 * Falls back to static pages only if Firestore is unreachable.
 *
 * No lastmod (would be dishonest), no changefreq/priority (Google ignores them).
 * Excludes /admin.
 *
 * Note: imports are relative — server/routes/ is outside the src/ Vite alias scope.
 * Firebase env vars are available via process.env (injected by Vite/Nitro at build).
 */
import { defineEventHandler, setHeader } from "h3";
import { collection, getDocs } from "firebase/firestore/lite";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

const SITE_URL = process.env["VITE_SITE_URL"] ?? "https://comeetspace.com";

const STATIC_PATHS = ["/", "/formations", "/a-propos", "/contact"];

function getDb() {
  const existing = getApps()[0];
  const app = existing ?? initializeApp({
    apiKey:     process.env["VITE_FIREBASE_API_KEY"],
    authDomain: process.env["VITE_FIREBASE_AUTH_DOMAIN"],
    projectId:  process.env["VITE_FIREBASE_PROJECT_ID"],
  });
  return getFirestore(app);
}

export default defineEventHandler(async (event) => {
  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=3600");

  let courseSlugs: string[] = [];
  try {
    const db   = getDb();
    const snap = await getDocs(collection(db, "courses"));
    courseSlugs = snap.docs.map((d) => d.id);
  } catch {
    // Firestore unreachable — serve static pages only
  }

  const allPaths = [...STATIC_PATHS, ...courseSlugs.map((s) => `/formations/${s}`)];

  const urls = allPaths
    .map((path) => {
      const loc = `${SITE_URL}${path === "/" ? "" : path}`;
      return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
});
