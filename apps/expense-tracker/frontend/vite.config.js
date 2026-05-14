import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4035,
    strictPort: true,
    host: true,
    proxy: {
      '/expenses': 'http://localhost:4031',
      '/health': 'http://localhost:4031',
    },
  },
});
