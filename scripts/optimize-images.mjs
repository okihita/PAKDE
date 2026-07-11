// eslint-env node
// Optimize bundled raster images for release size.
//
// Scans public/ for *.png, re-encodes each to WebP (capped width, alpha
// preserved) and deletes the original. Keeps the installer/update small —
// the app code is ~2 MB but uncompressed PNGs were bloating it to ~80 MB.
//
// Run with: node scripts/optimize-images.mjs

import sharp from "sharp";
import { readdir, rm } from "node:fs/promises";
import { join, extname, basename } from "node:path";

const PUBLIC_DIR = join(process.cwd(), "public");
const MAX_WIDTH = 1920;
const QUALITY = 82;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    if (extname(entry.name).toLowerCase() !== ".png") continue;

    const out = join(dir, `${basename(entry.name, ".png")}.webp`);
    const image = sharp(path);
    const meta = await image.metadata();
    const width = meta.width && meta.width > MAX_WIDTH ? MAX_WIDTH : meta.width;
    await image.resize({ width, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(out);
    await rm(path);
    console.log(`optimized ${path} (${meta.width}x${meta.height}) -> ${out}`);
  }
}

await walk(PUBLIC_DIR);
console.log("done");
