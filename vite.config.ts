import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

function userScriptPlugin(appUrl: string) {
  return {
    name: "userscript-plugin",
    writeBundle() {
      const filePath = path.resolve(__dirname, "dist/static/install.user.js");
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, "utf-8");
        content = content.replace(/{VITE_APP_URL}/g, appUrl);
        fs.writeFileSync(filePath, content);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appUrl = env.VITE_APP_URL || "http://localhost:3000";
  const appBase = env.VITE_APP_BASE || "./";
  console.log(appUrl, appBase);

  return {
    plugins: [react(), userScriptPlugin(appUrl)],
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
    base: appBase,
  };
});
