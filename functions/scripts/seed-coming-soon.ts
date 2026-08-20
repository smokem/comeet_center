/**
 * Seed the settings/comingSoon document with approved defaults.
 *
 * Run from repo root:
 *   cd functions && node_modules\.bin\tsx.cmd scripts/seed-coming-soon.ts
 *
 * Uses the Firebase CLI refresh-token approach (same as seed-firestore.ts).
 */

import { readFileSync, writeFileSync } from "node:fs";
import https from "node:https";
import { homedir } from "node:os";
import { join } from "node:path";

const PROJECT_ID = "commit-8da1d";
const CONFIG_PATH = join(homedir(), ".config", "configstore", "firebase-tools.json");

// ---------------------------------------------------------------------------
// Token refresh (same helper as refresh-token.ts)
// ---------------------------------------------------------------------------

async function getToken(): Promise<string> {
  const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf8")) as {
    tokens: { access_token: string; refresh_token: string; expires_at: number };
  };

  if (raw.tokens.expires_at - Date.now() > 60_000) return raw.tokens.access_token;

  console.log("Refreshing token…");
  const body = new URLSearchParams({
    client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
    refresh_token: raw.tokens.refresh_token,
    grant_type: "refresh_token",
  }).toString();

  const res = await new Promise<{ status: number; body: string }>((resolve, reject) => {
    const req = https.request(
      "https://oauth2.googleapis.com/token",
      { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": body.length } },
      (r) => { let b = ""; r.on("data", (c: Buffer) => { b += c.toString(); }); r.on("end", () => resolve({ status: r.statusCode ?? 0, body: b })); },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });

  const data = JSON.parse(res.body) as { access_token: string; expires_in: number };
  raw.tokens.access_token = data.access_token;
  raw.tokens.expires_at = Date.now() + data.expires_in * 1000;
  writeFileSync(CONFIG_PATH, JSON.stringify(raw, null, "\t"));
  return data.access_token;
}

// ---------------------------------------------------------------------------
// Firestore REST helpers
// ---------------------------------------------------------------------------

function toValue(v: unknown): unknown {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  return { stringValue: String(v) };
}

function toDocument(data: Record<string, unknown>) {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) fields[k] = toValue(v);
  return { fields };
}

async function upsert(
  path: string,
  data: Record<string, unknown>,
  token: string,
): Promise<void> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`;

  const res = await new Promise<{ status: number; body: string }>((resolve, reject) => {
    const body = JSON.stringify(toDocument(data));
    const req = https.request(
      url,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (r) => { let b = ""; r.on("data", (c: Buffer) => { b += c.toString(); }); r.on("end", () => resolve({ status: r.statusCode ?? 0, body: b })); },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });

  if (res.status >= 400) throw new Error(`PATCH ${path} ${res.status}: ${res.body.slice(0, 200)}`);
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seed() {
  const token = await getToken();

  await upsert("settings/comingSoon", {
    targetDate: "2026-08-29T00:00:00",
    headlineFr: "Ouverture le 29 Août",
    headlineEn: "Opening August 29",
    supportingLine: "Un nouvel espace de formation arrive à Sfax.",
    ctaLabel: "Nous contacter",
    ctaType: "tel",
    ctaValue: "+21622489100",
    forceState: "auto",
    updatedBy: "seed-script",
  }, token);

  console.log("✅ settings/comingSoon seeded in commit-8da1d");
}

seed().catch((err: unknown) => {
  console.error("❌", err instanceof Error ? err.message : err);
  process.exit(1);
});
