import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        ko: 'ko.html',
        ja: 'ja.html',
        admin: 'admin.html',
        'admin-jp': 'admin-jp.html',
      },
    },
  },
});
