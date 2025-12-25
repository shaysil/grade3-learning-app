import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // חשוב ל-GitHub Pages (repo pages)
  base: "/grade3-learning-app/",
});
