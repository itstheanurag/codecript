import { createLogger, defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// Rolldown statically flags PGlite's Emscripten runtime (EM_ASM/EM_JS support),
// which contains `eval` in a code path Postgres does not execute. It is
// third-party noise, not a warning about this codebase.
const logger = createLogger();
const baseWarn = logger.warn.bind(logger);
logger.warn = (message, options) => {
  const text = typeof message === "string" ? message : "";
  if (text.includes("[EVAL]") && text.includes("eval")) return;
  baseWarn(message, options);
};

// https://vite.dev/config/
export default defineConfig({
  customLogger: logger,
  plugins: [react(), tailwindcss()],
  // PGlite ships its own WASM loader; Vite's dep pre-bundling breaks it.
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  build: {
    // The content store bundles every markdown page for the sidebar and search
    // (~390 kB gzip). It is a single cacheable chunk by design; WASM is an
    // asset and loaded on demand, not part of this budget.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/content/") || id.includes("src/lib/content.ts")) {
            return "content-store";
          }
          if (id.includes("node_modules")) {
            if (
              id.includes("react-markdown") ||
              id.includes("remark-gfm") ||
              id.includes("micromark") ||
              id.includes("unist") ||
              id.includes("mdast") ||
              id.includes("vfile")
            ) {
              return "vendor-markdown";
            }
            if (id.includes("fuse.js")) return "vendor-fuse";
            if (id.includes("lucide-react")) return "vendor-icons";
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom") ||
              id.includes("react-helmet-async")
            ) {
              return "vendor-react";
            }
          }
        },
      },
    },
  },
});
