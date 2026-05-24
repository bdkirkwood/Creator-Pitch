import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // Read APPS_SCRIPT_URL directly from Node's process.env so Netlify's
        // injected build variables are always picked up (loadEnv only reads
        // .env files, which aren't committed to git).
        'process.env.APPS_SCRIPT_URL': JSON.stringify(process.env.APPS_SCRIPT_URL ?? '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
