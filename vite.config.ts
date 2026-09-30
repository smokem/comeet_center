import { resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// ---------------------------------------------------------------------------
// IMPORTANT: set `root` explicitly so Vite uses THIS directory as the
// project root when crawling for tsconfig.json / package.json.
//
// Without this, Vite (via the now-removed vite-tsconfig-paths plugin and also
// the native tsconfigPaths resolver) walks UP the directory tree and finds
// C:\Users\User\package.json + pnpm-workspace.yaml, which causes it to scan
// ALL projects on the machine, printing dozens of "[tsconfig-paths] parse
// error" warnings and consuming 34–80% of build time.
// ---------------------------------------------------------------------------
const projectRoot = resolve(__dirname);

export default defineConfig({
  // Pin the root so nothing escapes this directory
  root: projectRoot,

  resolve: {
    // Native Vite 8 tsconfig paths — replaces the vite-tsconfig-paths plugin.
    // Reads the "paths" from tsconfig.json without scanning parent directories.
    tsconfigPaths: true,
  },

  plugins: [
    nitro({
      // When NITRO_PRESET env var is set to "vercel" (set this in Vercel dashboard),
      // Nitro outputs to .vercel/output/ which Vercel reads natively.
      // Locally (node-server preset) the output stays in .output/.
    }),
    tanstackStart(),
    tailwindcss(),
    react(),
  ],

  // ---------------------------------------------------------------------------
  // SSR environment: tell Vite NOT to bundle these packages.
  // They are large, Node-only, and already present in node_modules at runtime
  // (node-server preset). Externalizing them:
  //   • Eliminates "Module node:async_hooks has been externalized" warnings
  //     (those fire when server-only code gets pulled into a client env)
  //   • Reduces the server bundle size (~2 MB → much smaller)
  //   • Makes the SSR build faster (no need to transform/chunk Firebase)
  // ---------------------------------------------------------------------------
  ssr: {
    external: [
      "firebase",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
      "firebase/firestore/lite",
      "@firebase/app",
      "@firebase/auth",
      "@firebase/firestore",
      "@firebase/firestore-lite",
      "@firebase/util",
      "@firebase/component",
      "@firebase/logger",
      "@firebase/installations",
    ],
  },
});
