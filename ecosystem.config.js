// PM2 process configuration for OsuStocks.Web.
//
// Runs the Next.js production server (`next start`). Build first with `npm run build`.
//   Local:   npm run pm2:start   (then pm2:logs / pm2:status / pm2:stop / pm2:delete)
//   Docker:  the image starts this via `pm2-runtime start ecosystem.config.js`
//
// The port comes from the single source of truth: .env.local / .env (or the PORT
// env var, e.g. when running inside the Docker container).
// To use all CPU cores, set `instances: 'max'` and `exec_mode: 'cluster'`.
const fs = require('fs');
const path = require('path');

function readPort() {
  for (const file of ['.env.local', '.env']) {
    try {
      const match = fs.readFileSync(path.join(__dirname, file), 'utf8').match(/^\s*PORT\s*=\s*(\d+)/m);
      if (match) return Number(match[1]);
    } catch {
      // file missing — try the next one
    }
  }
  return Number(process.env.PORT) || 3000;
}

const port = readPort();

module.exports = {
  apps: [
    {
      name: 'osustocks-web',
      script: 'node_modules/next/dist/bin/next',
      args: `start -p ${port}`,
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: port,
      },
    },
  ],
};
