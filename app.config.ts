import { defineConfig } from "@tanstack/start/config";
import path from "path";

export default defineConfig({
  server: {
    preset: "node-server"
  },
  routers: {
    client: {
      dir: './frontend/src',
    },
    ssr: {
      dir: './frontend/src',
    },
    server: {
      dir: './frontend/src',
    }
  },
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./frontend/src")
      }
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        }
      }
    }
  }
});
