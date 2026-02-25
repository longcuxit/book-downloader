import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      utils: path.resolve(__dirname, "src/utils"),
      widgets: path.resolve(__dirname, "src/widgets"),
      models: path.resolve(__dirname, "src/models"),
      types: path.resolve(__dirname, "src/types"),
      helper: path.resolve(__dirname, "src/helper.ts"),
      controller: path.resolve(__dirname, "src/controller.ts"),
      Downloader: path.resolve(__dirname, "src/Downloader.ts"),
    },
  },
  server: {
    port: 3000,
    cors: true,
  },
  base: "./",
});
