/**
 * Creates the admin Firebase Auth user for commit-8da1d.
 * Run: node_modules\.bin\tsx.cmd scripts/create-admin-user.ts
 */
import { readFileSync } from "node:fs";
import https from "node:https";
import { homedir } from "node:os";
import { join } from "node:path";

const PROJECT_ID = "commit-8da1d";
const ADMIN_EMAIL = "admin@comeet.space";
const ADMIN_PASSWORD = "ComeetAdmin2026!";

function getToken(): string {
  const config = JSON.parse(
    readFileSync(join(homedir(), ".config", "configstore", "firebase-tools.json"), "utf8"),
  ) as { tokens: { access_token: string } };
  return config.tokens.access_token;
}

function httpsPost(hostname: string, path: string, headers: Record<string, string>, body: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(body, "utf8");
    const req = https.request(
      { hostname, path, method: "POST", headers: { ...headers, "Content-Length": data.length } },
      (res) => {
        let raw = "";
        res.on("data", (chunk: Buffer) => { raw += chunk.toString(); });
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body: raw }));
      },
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function createUser() {
  const token = getToken();
  const body = JSON.stringify({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    displayName: "Admin Co.meet Space",
    emailVerified: true,
    disabled: false,
  });

  const { status, body: text } = await httpsPost(
    "identitytoolkit.googleapis.com",
    `/v1/projects/${PROJECT_ID}/accounts`,
    { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body,
  );

  console.log("Status:", status);

  if (status >= 400) {
    const data = JSON.parse(text) as { error?: { message: string } };
    if (data.error?.message === "EMAIL_EXISTS") {
      console.log(`ℹ️  User ${ADMIN_EMAIL} already exists — nothing to do.`);
      return;
    }
    throw new Error(`${status}: ${data.error?.message ?? text.slice(0, 200)}`);
  }

  const data = JSON.parse(text) as { localId: string };
  console.log(`\n✅ Admin user created`);
  console.log(`   UID:      ${data.localId}`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`\nChange this password after first login.`);
}

createUser().catch((err: unknown) => {
  console.error("❌", err instanceof Error ? err.message : err);
  process.exit(1);
});
