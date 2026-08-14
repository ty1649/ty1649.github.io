// Resizes gallery images to a sane max dimension and emits WebP copies
// alongside an original-format fallback, writing everything to a new
// directory tree. Originals under projects/images/ are never touched.
//
// Usage: node tools/optimize-images.mjs [--max-dimension=2000] [--quality=82] [--slug=widget]
//
// --slug restricts the run to a single projects/images/<slug>/ directory --
// use it after tools/new-project.mjs so scaffolding one project doesn't
// require re-encoding every other project's images.
import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const SRC_DIR = path.join(REPO_ROOT, 'projects', 'images');
const OUT_DIR = path.join(REPO_ROOT, 'projects', 'images-optimized');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);
const MAX_DIMENSION = Number(args['max-dimension'] ?? 2000);
const QUALITY = Number(args.quality ?? 82);

const RASTER_EXTS = new Set(['.png', '.jpg', '.jpeg']);

function walkProjectDirs() {
  if (args.slug) {
    if (!existsSync(path.join(SRC_DIR, args.slug))) {
      console.error(`No such project directory: projects/images/${args.slug}/`);
      process.exit(1);
    }
    return [args.slug];
  }
  return readdirSync(SRC_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

async function optimizeFile(srcPath, outDir, baseName, ext) {
  const originalBytes = statSync(srcPath).size;
  const image = sharp(srcPath);
  const meta = await image.metadata();
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
  const resize = longEdge > MAX_DIMENSION
    ? { width: meta.width >= meta.height ? MAX_DIMENSION : null,
        height: meta.height > meta.width ? MAX_DIMENSION : null }
    : null;

  const fallbackPipeline = resize ? sharp(srcPath).resize(resize) : sharp(srcPath);
  const webpPipeline = resize ? sharp(srcPath).resize(resize) : sharp(srcPath);

  const fallbackPath = path.join(outDir, `${baseName}${ext}`);
  const webpPath = path.join(outDir, `${baseName}.webp`);

  if (ext === '.png') {
    await fallbackPipeline.png({ quality: QUALITY, compressionLevel: 9 }).toFile(fallbackPath);
  } else {
    await fallbackPipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toFile(fallbackPath);
  }
  await webpPipeline.webp({ quality: QUALITY }).toFile(webpPath);

  const fallbackBytes = statSync(fallbackPath).size;
  const webpBytes = statSync(webpPath).size;
  return { originalBytes, fallbackBytes, webpBytes };
}

function fmtMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.error(`Source directory not found: ${SRC_DIR}`);
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const projects = walkProjectDirs();
  let grandOriginal = 0;
  let grandOptimized = 0;

  for (const project of projects) {
    const srcDir = path.join(SRC_DIR, project);
    const outDir = path.join(OUT_DIR, project);
    mkdirSync(outDir, { recursive: true });

    const files = readdirSync(srcDir, { withFileTypes: true }).filter((f) => f.isFile());
    let projOriginal = 0;
    let projOptimized = 0;
    let processed = 0;

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      const srcPath = path.join(srcDir, file.name);

      if (!RASTER_EXTS.has(ext)) {
        continue; // leave PDFs and other non-raster assets alone; not resized/converted
      }

      const baseName = path.basename(file.name, ext);
      const { originalBytes, fallbackBytes, webpBytes } = await optimizeFile(
        srcPath,
        outDir,
        baseName,
        ext
      );
      projOriginal += originalBytes;
      // Optimized footprint = the smaller of the two emitted files, since a page
      // using a <picture> WebP-with-fallback pattern only ships one per client.
      projOptimized += Math.min(fallbackBytes, webpBytes);
      processed++;
    }

    if (processed === 0) continue;
    grandOriginal += projOriginal;
    grandOptimized += projOptimized;
    const pct = (100 * (1 - projOptimized / projOriginal)).toFixed(0);
    console.log(
      `${project}: ${processed} image(s)  ${fmtMB(projOriginal)} -> ${fmtMB(projOptimized)}  (-${pct}%)`
    );
  }

  const grandPct = (100 * (1 - grandOptimized / grandOriginal)).toFixed(0);
  console.log('---');
  console.log(`Total: ${fmtMB(grandOriginal)} -> ${fmtMB(grandOptimized)}  (-${grandPct}%)`);
  console.log(`Originals untouched. Optimized output written to: ${path.relative(REPO_ROOT, OUT_DIR)}/`);
}

main();
