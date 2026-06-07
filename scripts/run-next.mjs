// Runs `next <cmd>` on the PORT defined in .env.local / .env.
//
// Next.js cannot read PORT from .env itself (its HTTP server boots before env
// files are loaded), so this launcher reads PORT from the env files and passes
// it through both as the `-p` flag and process.env.PORT. This keeps .env the
// single source of truth for the web port across dev, start, PM2, and Docker.
//
// Usage: node scripts/run-next.mjs <dev|start> [extra next args]
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function readPort() {
  for (const file of ['.env.local', '.env']) {
    try {
      const match = readFileSync(join(root, file), 'utf8').match(/^\s*PORT\s*=\s*(\d+)/m);
      if (match) return match[1];
    } catch {
      // file missing — try the next one
    }
  }
  return process.env.PORT || '3000';
}

const cmd = process.argv[2];
if (cmd !== 'dev' && cmd !== 'start') {
  console.error('Usage: node scripts/run-next.mjs <dev|start> [extra next args]');
  process.exit(1);
}

const port = readPort();
const nextBin = join(root, 'node_modules', 'next', 'dist', 'bin', 'next');

const child = spawn(process.execPath, [nextBin, cmd, '-p', port, ...process.argv.slice(3)], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port },
});
child.on('exit', (code) => process.exit(code ?? 0));
