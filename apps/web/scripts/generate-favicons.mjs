#!/usr/bin/env node
/**
 * Generates all favicon assets from the source SVGs in assets/.
 *
 * Usage:  node scripts/generate-favicons.mjs
 * Output: public/favicon.ico, icon.svg, apple-touch-icon.png,
 *         favicon-192.png, favicon-512.png
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const assets = resolve(root, "assets");
const pub = resolve(root, "public");

const lightSvg = readFileSync(resolve(assets, "duck_duck-light.svg"));
const darkSvg = readFileSync(resolve(assets, "duck_duck-dark.svg"));

// ── 1. Rasterize PNGs from the light SVG ───────────────────────────
async function toPng(svgBuffer, size) {
  return sharp(svgBuffer, { density: 400 })
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

const [png32, png180, png192, png512] = await Promise.all([
  toPng(lightSvg, 32),
  toPng(lightSvg, 180),
  toPng(lightSvg, 192),
  toPng(lightSvg, 512),
]);

// ── 2. Build favicon.ico (single 32×32 PNG wrapped in ICO container)
function buildIco(pngBuf) {
  // ICO header: reserved(2) + type=1(2) + count=1(2) = 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count

  // ICO directory entry: 16 bytes
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width (32 = 32px, 0 would mean 256)
  entry.writeUInt8(32, 1); // height
  entry.writeUInt8(0, 2); // color palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuf.length, 8); // image data size
  entry.writeUInt32LE(22, 12); // offset to image data (6 + 16)

  return Buffer.concat([header, entry, pngBuf]);
}

// ── 3. Build combined icon.svg with dark-mode media query ───────────
function buildDualSvg(lightSource, darkSource) {
  const extractInner = (svg) => {
    const str = svg.toString("utf-8");
    const clean = str.replace(/<\?xml[^?]*\?>\s*/, "");
    const match = clean.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
    return match ? match[1] : clean;
  };

  const vbMatch = lightSource.toString("utf-8").match(/viewBox="([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : "0 0 540 576";

  const lightInner = extractInner(lightSource);
  const darkInner = extractInner(darkSource);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
<style>
  .dark { display: none }
  @media (prefers-color-scheme: dark) {
    .light { display: none }
    .dark { display: inline }
  }
</style>
<g class="light">${lightInner}</g>
<g class="dark">${darkInner}</g>
</svg>`;
}

// ── 4. Write everything ─────────────────────────────────────────────
writeFileSync(resolve(pub, "favicon.ico"), buildIco(png32));
writeFileSync(resolve(pub, "apple-touch-icon.png"), png180);
writeFileSync(resolve(pub, "favicon-192.png"), png192);
writeFileSync(resolve(pub, "favicon-512.png"), png512);
writeFileSync(resolve(pub, "icon.svg"), buildDualSvg(lightSvg, darkSvg));

console.log("✓ favicon.ico        (32×32)");
console.log("✓ apple-touch-icon.png (180×180)");
console.log("✓ favicon-192.png    (192×192)");
console.log("✓ favicon-512.png    (512×512)");
console.log("✓ icon.svg           (light + dark)");
