// Entry point for gta6-trophy-guide-01 (Node 22, standard library only).
//
// The guide itself is the static site in app/ — plain HTML, CSS, one script and
// its trophy data, with no build step and no network use. This program hands it
// in: it copies app/ and screenshots/ next to this file into the output
// directory and writes dossier.json there with the vendored make.fun library
// (vendor/makefun-frontend.ts, kept byte-for-byte as the scorer requires).
//
// Output directory: /output inside the grader, or $MAKEFUN_OUTPUT_DIR locally:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(root, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(root, 'screenshots'))) {
  cpSync(join(root, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Caps mirror the competition gate: dossier text budget, at most 4 screenshots
// of at most 256 KiB each, app/ at most 993 entries and 48 MiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`dossier.json written to ${outDir} (${dossier.length} bytes)`);
