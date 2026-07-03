import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy opcional: descomentar para pegarle al backend sin CORS en dev.
    // proxy: {
    //   '/api': 'http://localhost:3000',
    // },
  },
});
