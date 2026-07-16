import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During `vite dev`, proxy /api to the API so the SPA can be developed outside
// Docker without CORS. In the Docker stack, the built static files are served
// behind the shared nginx proxy, which handles /api routing instead.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
});
