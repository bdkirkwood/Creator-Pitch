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
        // Set APPS_SCRIPT_URL in .env.local to your deployed Apps Script web app URL:
        //   APPS_SCRIPT_URL=https://script.google.com/macros/s/<YOUR_SCRIPT_ID>/exec
        'process.env.APPS_SCRIPT_URL': JSON.stringify(env.APPS_SCRIPT_URL ?? '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
