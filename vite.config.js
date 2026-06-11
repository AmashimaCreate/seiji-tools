import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

// くらしと制度のツール群（手取り・年収の壁）。
// seiji-mieru.com/tools/ 配下で公開するため base は "/tools/"。
// ハブ側（seiji-mieru リポジトリ）の build.sh が本リポジトリをビルドし、
// dist/ をハブの dist/tools/ にコピーする。
export default defineConfig({
  base: "/tools/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: r("index.html"),
        tedori: r("tedori/index.html"),
        kabe: r("kabe/index.html"),
      },
    },
  },
});
