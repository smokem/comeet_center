/**
 * /robots.txt — served by Nitro at build time.
 *
 * AI crawler policy: all major AI crawlers are explicitly allowed.
 * Changing Allow: / to Disallow: / per-agent opts out of that crawler.
 *
 * SITE_URL is inlined here because server/routes/ is outside the Vite
 * alias scope and cannot import from src/. Keep in sync with VITE_SITE_URL.
 */
import { defineEventHandler, setHeader } from "h3";

const SITE_URL = process.env["VITE_SITE_URL"] ?? "https://comeetspace.com";

export default defineEventHandler((event) => {
  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=86400");

  return `# Co.meet Space — robots.txt
# Canonical deployment: Vercel

User-agent: *
Allow: /
Disallow: /admin

# ── AI / LLM crawlers ──────────────────────────────────────────────────────
# Allowing these crawlers improves discoverability on AI answer engines.
# To opt out, change Allow: / to Disallow: / for each agent.

User-agent: GPTBot
Allow: /
Disallow: /admin

User-agent: OAI-SearchBot
Allow: /
Disallow: /admin

User-agent: ChatGPT-User
Allow: /
Disallow: /admin

User-agent: ClaudeBot
Allow: /
Disallow: /admin

User-agent: Claude-SearchBot
Allow: /
Disallow: /admin

User-agent: PerplexityBot
Allow: /
Disallow: /admin

User-agent: Google-Extended
Allow: /
Disallow: /admin

User-agent: Applebot-Extended
Allow: /
Disallow: /admin

User-agent: CCBot
Allow: /
Disallow: /admin

Sitemap: ${SITE_URL}/sitemap.xml
`;
});
