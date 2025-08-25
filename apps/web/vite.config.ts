import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: null // disable postcss auto-loading
  },
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    sourcemap: true,
    outDir: "dist"
  }
});
