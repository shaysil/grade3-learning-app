import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// חשוב: שם הריפו
export default defineConfig({
  plugins: [react()],
  base: "/grade3-learning-app/",
});
