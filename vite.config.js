import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev server runs on http://localhost:5173 (matches PUBLIC_ORIGIN in the backend .env)
// and forwards every /api request to the FastAPI backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
});
