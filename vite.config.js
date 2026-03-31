import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    host: true,
    port: 8080
  },
  preview: {
    host: true,
    port: 8080
  },
  build: {
    rollupOptions: {
      input: {
        vipLandscapeV2: resolve(__dirname, "vip-landscape-v2.html")
      }
    }
  }
});
