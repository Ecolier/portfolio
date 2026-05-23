import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const source = await readFile(new URL("../public/icon.svg", import.meta.url));
const publicDir = new URL("../public/", import.meta.url);

async function writePng(size, filename) {
  await sharp(source, { density: 384 })
    .resize(size, size, { fit: "contain" })
    .png()
    .toFile(fileURLToPath(new URL(filename, publicDir)));
}

await writePng(48, "favicon-48.png");
await writePng(180, "apple-touch-icon.png");
await writePng(192, "favicon-192.png");
await writePng(512, "favicon-512.png");

const icoImages = await Promise.all(
  [16, 32].map(async (size) => ({
    size,
    data: await sharp(source, { density: 384 })
      .resize(size, size, { fit: "contain" })
      .png()
      .toBuffer(),
  })),
);

const headerSize = 6;
const entrySize = 16;
let offset = headerSize + icoImages.length * entrySize;
const header = Buffer.alloc(headerSize);
const directory = Buffer.alloc(icoImages.length * entrySize);
const chunks = [header, directory];

header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoImages.length, 4);

icoImages.forEach(({ size, data }, index) => {
  const entry = directory.subarray(index * entrySize, (index + 1) * entrySize);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(data.length, 8);
  entry.writeUInt32LE(offset, 12);
  chunks.push(data);
  offset += data.length;
});

await writeFile(new URL("favicon.ico", publicDir), Buffer.concat(chunks));
