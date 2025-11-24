import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Replaces process.env.API_KEY in the code with the actual value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    server: {
      host: true
    }
  };
});