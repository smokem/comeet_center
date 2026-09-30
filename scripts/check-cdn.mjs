/**
 * scripts/check-cdn.mjs
 *
 * Verifies every Cloudinary image in VENUE_IMAGES is reachable and returns
 * an image content-type at all three srcset widths (480, 768, 1280) plus
 * the blur placeholder variant.
 *
 * Uses Node 18+ built-in fetch — no dependencies.
 * Exits 1 on any failure; exits 0 when all checks pass.
 *
 * Usage:
 *   npm run check:cdn
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Parse publicIds from venue-images.ts without ts-node
// ---------------------------------------------------------------------------
const src = readFileSync(
  join(__dirname, "..", "src", "lib", "venue-images.ts"),
  "utf8",
);
const publicIds = [...src.matchAll(/publicId:\s*["']([^"']+)["']/g)].map(
  (m) => m[1],
);

if (publicIds.length === 0) {
  console.error("ERROR: No publicId entries found in venue-images.ts");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// URL builder (mirrors cdn.ts)
// ---------------------------------------------------------------------------
const CLOUD = "jhaaukjn";
const BASE  = `https://res.cloudinary.com/${CLOUD}/image/upload`;
const WIDTHS = [480, 768, 1280];

function cdnUrl(publicId, width) {
  return `${BASE}/f_auto,q_auto,w_${width}/${publicId}`;
}
function blurUrl(publicId) {
  return `${BASE}/f_auto,q_1,w_24,e_blur:800/${publicId}`;
}

// ---------------------------------------------------------------------------
// Check one URL
// ---------------------------------------------------------------------------
async function check(url) {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "image/avif,image/webp,*/*" },
    // Abort after 10 s
    signal: AbortSignal.timeout(10_000),
  });

  if (res.status !== 200) {
    return { ok: false, reason: `HTTP ${res.status}` };
  }
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.startsWith("image/")) {
    return { ok: false, reason: `bad content-type: ${ct}` };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
console.log(`\nChecking ${publicIds.length} Cloudinary images × ${WIDTHS.length + 1} URLs each…\n`);

let errors = 0;

for (const id of publicIds) {
  const urls = [
    ...WIDTHS.map((w) => ({ label: `w_${w}`, url: cdnUrl(id, w) })),
    { label: "blur", url: blurUrl(id) },
  ];

  for (const { label, url } of urls) {
    const result = await check(url);
    if (result.ok) {
      console.log(`  ✓  ${id}  [${label}]`);
    } else {
      console.error(`  ✗  ${id}  [${label}]  ${result.reason}`);
      console.error(`     ${url}`);
      errors++;
    }
  }
}

console.log(`\n${errors} error(s).\n`);
if (errors > 0) {
  console.error("check:cdn FAILED — fix the errors above before deploying.");
  process.exit(1);
}
console.log("check:cdn passed.");
