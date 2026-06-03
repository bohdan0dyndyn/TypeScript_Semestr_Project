import { defineConfig } from "vite";

const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
