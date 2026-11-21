// Entry point for gta6-trophy-guide-01 (Node 22, standard library only).
//
// The guide itself is the static site in app/ — plain HTML, CSS, one script
// and its trophy data, with no build step and no network use. This program
// hands the entry in: it copies app/ and screenshots/ from beside this file
// into the output directory and writes dossier.json there, built with the
// vendored make.fun library (vendor/makefun-frontend.ts, kept byte-for-byte
// as the scorer requires).
//
// After copying, it verifies its own work: dossier.json is parsed back from
// disk, the whole output tree is walked, and manifest.json records every
// output file's size and SHA-256 so a reviewer can confirm the handoff is
// complete and untampered without re-running anything.
//
// Output directory: /output inside the grader, or $MAKEFUN_OUTPUT_DIR locally:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/* Preflight: every path the handoff depends on must exist before anything
   is copied. A missing input is a clean, immediate failure — non-zero exit
   and a named list of what is absent — never a half-written output tree. */
const REQUIRED = [
  'app/index.html',
  'app/app.js',
  'app/style.css',
  'app/data/trophies.json',
  'app/data/trophies-data.js',
  'vendor/makefun-frontend.ts',
];
const missing = REQUIRED.filter((p) => !existsSync(join(root, p)));
if (missing.length > 0) {
  console.error('preflight failed — required paths are missing:');
  for (const p of missing) console.error(`  - ${p}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
cpSync(join(root, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(root, 'screenshots'))) {
  cpSync(join(root, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Caps mirror the competition gate: a dossier text budget, at most 4
// screenshots of at most 256 KiB each, app/ at most 993 entries and 48 MiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

/* Post-copy verification: the dossier on disk must parse as JSON, and the
   output tree is walked so manifest.json can record a SHA-256 and a size
   for every file the handoff contains (dossier.json included; the manifest
   itself is written last and is the one file it does not list). */
let dossierParsed: unknown;
try {
  dossierParsed = JSON.parse(readFileSync(join(outDir, 'dossier.json'), 'utf8'));
} catch (err) {
  console.error(`verification failed — dossier.json does not parse: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
if (typeof dossierParsed !== 'object' || dossierParsed === null) {
  console.error('verification failed — dossier.json is not a JSON object');
  process.exit(1);
}

function walk(dir: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) found.push(...walk(full));
    else found.push(full);
  }
  return found;
}
const manifestFiles = walk(outDir).map((full) => {
  const body = readFileSync(full);
  return {
    path: relative(outDir, full).split('\\').join('/'),
    bytes: body.length,
    sha256: createHash('sha256').update(body).digest('hex'),
  };
});
const manifest = {
  app: 'leonida-legend',
  entry: 'gta6-trophy-guide-01',
  files: manifestFiles,
  totalFiles: manifestFiles.length,
  totalBytes: manifestFiles.reduce((sum, f) => sum + f.bytes, 0),
};
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');

/* Human summary: what was handed in, where, and how to check it. */
console.log('Leonida Legend — handoff complete');
console.log(`  output directory : ${outDir}`);
console.log(`  dossier.json     : ${dossier.length} bytes, parsed back and verified`);
console.log(`  manifest.json    : ${manifest.totalFiles} files, ${manifest.totalBytes} bytes total, SHA-256 per file`);
console.log('  verify with      : sha256sum the files in the output directory and compare against manifest.json');
