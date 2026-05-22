/**
 * icon.svg から PWA 用 PNG を生成（sharp 不要の簡易版）
 * 実行: node scripts/generate-icons.mjs
 * sharp があれば高品質に変換、なければ SVG をコピーして README を参照
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const svgPath = path.join(publicDir, "icon.svg");

async function main() {
  try {
    const sharp = (await import("sharp")).default;
    const svg = fs.readFileSync(svgPath);
    await sharp(svg).resize(192, 192).png().toFile(path.join(publicDir, "icon-192.png"));
    await sharp(svg).resize(512, 512).png().toFile(path.join(publicDir, "icon-512.png"));
    console.log("Generated icon-192.png and icon-512.png");
  } catch {
    console.log(
      "sharp が未インストールです。npm install sharp -D の後に再実行するか、"
    );
    console.log("public/icon.svg を 192x192 / 512x512 の PNG に変換して icon-192.png, icon-512.png として配置してください。");
  }
}

main();
