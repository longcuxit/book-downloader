import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import fs from "fs";

function userScriptPlugin(appUrl: string): any {
  return {
    name: "userscript-plugin",
    writeBundle() {
      const filePath = path.resolve(__dirname, "dist/static/install.user.js");
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, "utf-8");
        content = content.replace("{VITE_APP_URL}", appUrl);
        fs.writeFileSync(filePath, content);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appUrl =
    process.env.VITE_APP_URL || env.VITE_APP_URL || "http://localhost:3000";
  const appBase = process.env.VITE_APP_BASE || env.VITE_APP_BASE || "./";

  return {
    plugins: [react(), tsconfigPaths(), userScriptPlugin(appUrl)],
    server: {
      port: 3000,
      cors: true,
    },
    base: appBase,
  };
});
