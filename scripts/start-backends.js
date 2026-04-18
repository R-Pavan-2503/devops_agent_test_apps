#!/usr/bin/env node
/**
 * Dynamically starts all backend servers found under apps/<app>/backend/
 * Port is read from each app's backend/package.json "port" field.
 * Falls back to BASE_PORT + (index * 10) + 1 if no port specified.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const APPS_DIR = path.join(__dirname, '..', 'apps');
const BASE_PORT = 4000;

function getApps() {
  if (!fs.existsSync(APPS_DIR)) return [];
  return fs.readdirSync(APPS_DIR)
    .filter(name => fs.statSync(path.join(APPS_DIR, name)).isDirectory())
    .sort();
}

function getPort(pkgPath, index, offset) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.port || (BASE_PORT + index * 10 + offset);
  } catch {
    return BASE_PORT + index * 10 + offset;
  }
}

const colors = ['cyan', 'magenta', 'yellow', 'blue', 'green', 'red'];
const colorCodes = {
  cyan: '\x1b[36m', magenta: '\x1b[35m', yellow: '\x1b[33m',
  blue: '\x1b[34m', green: '\x1b[32m', red: '\x1b[31m', reset: '\x1b[0m'
};

const apps = getApps();
console.log(`\n🚀 Starting ${apps.length} backend(s): ${apps.join(', ')}\n`);

apps.forEach((app, index) => {
  const backendDir = path.join(APPS_DIR, app, 'backend');
  const pkgPath    = path.join(backendDir, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    console.warn(`⚠️  No backend/package.json for "${app}", skipping.`);
    return;
  }

  const port  = getPort(pkgPath, index, 1);
  const color = colors[index % colors.length];
  const prefix = `${colorCodes[color]}[${app}:backend]${colorCodes.reset}`;

  const env = { ...process.env, PORT: String(port) };
  const child = spawn('npm', ['start'], { cwd: backendDir, env, shell: true });

  child.stdout.on('data', d => process.stdout.write(`${prefix} ${d}`));
  child.stderr.on('data', d => process.stderr.write(`${prefix} ${d}`));
  child.on('error', err => console.error(`${prefix} Error: ${err.message}`));
  child.on('close', code => console.log(`${prefix} exited with code ${code}`));

  console.log(`${prefix} Started on port ${port}`);
});
