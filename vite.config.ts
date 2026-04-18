import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 8088,
    strictPort: true,
    allowedHosts: [".lhr.life", ".lhr.rocks", ".loca.lt", ".localhost.run"],
  },
});
