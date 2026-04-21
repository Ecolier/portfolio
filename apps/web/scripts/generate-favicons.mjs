#!/usr/bin/env node
/**
 * Generates all favicon assets from the source SVGs in assets/.
 *
 * Usage:  node scripts/generate-favicons.mjs
 * Output: public/favicon.ico, icon.svg, apple-touch-icon.png,
 *         favicon-48.png, favicon-192.png, favicon-512.png
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const assets = resolve(root, "assets");
const pub = resolve(root, "public");

const faviconSvg = readFileSync(resolve(assets, "duck_favicon.svg"));
const lightSvg = readFileSync(resolve(assets, "duck_light.svg"));
const darkSvg = readFileSync(resolve(assets, "duck_dark.svg"));

// ── 1. Rasterize PNGs from the dedicated favicon SVG ───────────────
async function toPng(svgBuffer, size) {
  return sharp(svgBuffer, { density: 400 })
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

const [png16, png32, png48, png180, png192, png512] = await Promise.all([
  toPng(faviconSvg, 16),
  toPng(faviconSvg, 32),
  toPng(faviconSvg, 48),
  toPng(faviconSvg, 180),
  toPng(faviconSvg, 192),
  toPng(faviconSvg, 512),
]);

// ── 2. Build favicon.ico (16×16 + 32×32 PNGs wrapped in ICO)
function buildIco(pngBuffers) {
  // ICO header: reserved(2) + type=1(2) + count(2) = 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngBuffers.length, 4); // image count

  const entries = [];
  const images = [];
  let offset = 6 + pngBuffers.length * 16;

  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0); // width (0 means 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // image data size
    entry.writeUInt32LE(offset, 12); // offset to image data

    entries.push(entry);
    images.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images]);
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
writeFileSync(
  resolve(pub, "favicon.ico"),
  buildIco([
    { size: 16, buffer: png16 },
    { size: 32, buffer: png32 },
  ]),
);
writeFileSync(resolve(pub, "apple-touch-icon.png"), png180);
writeFileSync(resolve(pub, "favicon-48.png"), png48);
writeFileSync(resolve(pub, "favicon-192.png"), png192);
writeFileSync(resolve(pub, "favicon-512.png"), png512);
writeFileSync(resolve(pub, "icon.svg"), buildDualSvg(lightSvg, darkSvg));

console.log("✓ favicon.ico        (16×16 + 32×32)");
console.log("✓ apple-touch-icon.png (180×180)");
console.log("✓ favicon-48.png     (48×48)");
console.log("✓ favicon-192.png    (192×192)");
console.log("✓ favicon-512.png    (512×512)");
console.log("✓ icon.svg           (light + dark)");
