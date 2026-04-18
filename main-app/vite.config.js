import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPS_DIR  = path.join(__dirname, '..', 'apps');
const BASE_PORT = 4000;

/**
 * Dynamic App Discovery Vite Plugin
 * Serves GET /api/apps — scans the apps/ directory at request time.
 * No hardcoded names, ports, or paths.
 */
function appDiscoveryPlugin() {
  return {
    name: 'app-discovery',
    configureServer(server) {
      server.middlewares.use('/api/apps', (req, res) => {
        try {
          const apps = fs.existsSync(APPS_DIR)
            ? fs.readdirSync(APPS_DIR)
                .filter(name => fs.statSync(path.join(APPS_DIR, name)).isDirectory())
                .sort()
            : [];

          const result = apps.map((name, index) => {
            const frontendPkg = path.join(APPS_DIR, name, 'frontend', 'package.json');
            const backendPkg  = path.join(APPS_DIR, name, 'backend',  'package.json');

            let frontendPort = BASE_PORT + index * 10 + 5;
            let backendPort  = BASE_PORT + index * 10 + 1;

            try {
              const f = JSON.parse(fs.readFileSync(frontendPkg, 'utf8'));
              if (f.port) frontendPort = f.port;
            } catch (_) {}

            try {
              const b = JSON.parse(fs.readFileSync(backendPkg, 'utf8'));
              if (b.port) backendPort = b.port;
            } catch (_) {}

            return {
              name,
              displayName: name.charAt(0).toUpperCase() + name.slice(1),
              frontendPort,
              backendPort,
            };
          });

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), appDiscoveryPlugin()],
  server: {
    port: 3000,
    strictPort: true,
  },
});
