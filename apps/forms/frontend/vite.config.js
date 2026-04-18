import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4015,
    strictPort: true,
    host: true,
    proxy: {
      '/submit':      'http://localhost:4011',
      '/submissions': 'http://localhost:4011',
    },
  },
});
