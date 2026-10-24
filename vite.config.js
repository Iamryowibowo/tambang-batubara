import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Memaksa Vite memantau perubahan file (solusi utama Hot Reload macet)
    watch: {
      usePolling: true,
    },
    hmr: true, // Memastikan Hot Module Replacement aktif
  },
});
