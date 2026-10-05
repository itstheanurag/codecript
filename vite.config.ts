import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000,
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
