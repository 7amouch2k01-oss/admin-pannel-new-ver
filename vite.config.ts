import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

const devOnlyPlugins = [jsxLocPlugin(), vitePluginManusRuntime()];

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === "development" ? devOnlyPlugins : [])],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "client/index.html"),
      },
    },
  },
  server: {
    host: true,
    port: 3000,
    // The tRPC server used to host this SPA as Vite middleware, so /api was
    // same-origin. Now that it is gone, proxy /api to the Styly backend in dev
    // (VITE_API_BASE_URL takes over in production builds).
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:4000",
        changeOrigin: true,
      },
      "/uploads": {
        target: process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:4000",
        changeOrigin: true,
      },
      // Media lives at /files/:id. Without this, Vite's HTML fallback answers
      // image requests (their Accept header contains */*) with index.html and a
      // 200, so the image fails to decode while DevTools shows success.
      "/files": {
        target: process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:4000",
        changeOrigin: true,
      },
    },
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
}));
