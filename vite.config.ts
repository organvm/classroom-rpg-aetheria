import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname
const isPages = !!process.env.GITHUB_PAGES

// On the static GitHub Pages build there is no Spark runtime backend, so the
// real `@github/spark/spark` side-effect (POST /_spark/loaded) and every
// `useKV` call (GET /_spark/kv/*) would 404/405 on load — dozens of console
// errors. Swap those two modules for network-free, localStorage-backed shims
// at build time. Only active when GITHUB_PAGES is set; dev/normal builds are
// untouched and keep the real Spark runtime.
const sparkPagesAliases = isPages
  ? {
      '@github/spark/spark': resolve(projectRoot, 'src/lib/static-spark/spark.ts'),
      '@github/spark/hooks': resolve(projectRoot, 'src/lib/static-spark/hooks.ts'),
    }
  : {}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/classroom-rpg-aetheria/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
    // Add CSP headers for security
    // Note: 'unsafe-inline' is currently required for:
    // - Vite's HMR (Hot Module Replacement) in development
    // - GitHub Spark's runtime functionality
    // In production, consider implementing nonces or hashes for better security
    {
      name: 'csp-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
          )
          next()
        })
      }
    } as PluginOption,
  ],
  resolve: {
    alias: {
      // Spark runtime/hooks shims for the static Pages build (see above).
      ...sparkPagesAliases,
      '@': resolve(projectRoot, 'src')
    }
  },
  // Expose the Pages build flag so client code can skip unavailable backend calls.
  define: {
    __GITHUB_PAGES__: !!process.env.GITHUB_PAGES,
  },
  // Disable lightningcss CSS minification — Tailwind v4 generates
  // @media (width >= (display-mode: standalone)) which lightningcss cannot parse.
  build: {
    cssMinify: false,
  },
});
