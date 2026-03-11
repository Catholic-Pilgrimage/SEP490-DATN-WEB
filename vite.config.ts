import path from "path"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/vietmap': {
        target: 'https://maps.vietmap.vn/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vietmap/, ''),
      },
    },
  },
});
