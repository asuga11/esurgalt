import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "ESURGALT_");
  const target = env.ESURGALT_DEV_UPSTREAM?.trim() || "https://west.edu.mn";
  const proxy = {
    "^/api/v1(?=[/?]|$)": { target, changeOrigin: true },
    "^/upload(?=[/?]|$)": { target, changeOrigin: true },
  };

  return {
    plugins: [react(), tailwindcss()],
    server: { host: "127.0.0.1", port: 3000, strictPort: true, proxy },
    preview: { host: "127.0.0.1", port: 4173, strictPort: true, proxy },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/setupTests.js"],
    },
  };
});
