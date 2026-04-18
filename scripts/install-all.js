#!/usr/bin/env node
/**
 * Dynamically discovers all sub-apps in ../apps/ and installs their dependencies.
 * No app names are hardcoded — pure filesystem scan.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const APPS_DIR = path.join(__dirname, '..', 'apps');

function getApps() {
  if (!fs.existsSync(APPS_DIR)) return [];
  return fs.readdirSync(APPS_DIR).filter(name => {
    const stat = fs.statSync(path.join(APPS_DIR, name));
    return stat.isDirectory();
  });
}

const apps = getApps();

console.log(`\n🔍 Found ${apps.length} app(s): ${apps.join(', ')}\n`);

// Install main-app dependencies
console.log('📦 Installing main-app dependencies...');
execSync('npm install', { cwd: path.join(__dirname, '..', 'main-app'), stdio: 'inherit' });

// Install each sub-app frontend + backend
for (const app of apps) {
  const frontendDir = path.join(APPS_DIR, app, 'frontend');
  const backendDir  = path.join(APPS_DIR, app, 'backend');

  if (fs.existsSync(frontendDir) && fs.existsSync(path.join(frontendDir, 'package.json'))) {
    console.log(`\n📦 Installing ${app}/frontend...`);
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
  }
  if (fs.existsSync(backendDir) && fs.existsSync(path.join(backendDir, 'package.json'))) {
    console.log(`\n📦 Installing ${app}/backend...`);
    execSync('npm install', { cwd: backendDir, stdio: 'inherit' });
  }
}

console.log('\n✅ All dependencies installed!\n');
