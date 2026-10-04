import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env from current directory and parent directory so users can place .env in root or frontend
  const parentEnv = loadEnv(mode, path.resolve(process.cwd(), '..'), '');
  const localEnv = loadEnv(mode, process.cwd(), '');
  const apiKey = localEnv.VITE_GOOGLE_MAPS_API_KEY || parentEnv.VITE_GOOGLE_MAPS_API_KEY || '';

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(apiKey)
    }
  };
});
