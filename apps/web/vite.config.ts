import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appRoot = resolve(__dirname);

export default defineConfig({
  root: appRoot,
  plugins: [react()],
  css: {
    // Provide an explicit empty PostCSS config so Vite does NOT search parent dirs
    postcss: { plugins: [] }
  },
  server: { port: 5173, strictPort: true },
  build: { sourcemap: true, outDir: "dist" }
});
