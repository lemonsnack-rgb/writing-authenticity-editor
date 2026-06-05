import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        landing: 'landing.html',
        index: 'index.html',
        'index-jp': 'index-jp.html',
        admin: 'admin.html',
        'admin-jp': 'admin-jp.html',
      },
    },
  },
});
