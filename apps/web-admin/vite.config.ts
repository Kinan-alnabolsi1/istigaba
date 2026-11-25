import { istigabaHead } from '@istigaba/web-ui/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// web-admin: System Administrator console. Port 5174 (web-ops uses 5173).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiOrigin = env.VITE_API_BASE_URL ? new URL(env.VITE_API_BASE_URL).origin : '';

  return {
    plugins: [react(), tailwindcss(), istigabaHead({ connectSrc: apiOrigin ? [apiOrigin] : [] })],
    server: { host: 'localhost', port: 5174, strictPort: true },
    preview: { host: 'localhost', port: 4174, strictPort: true },
    test: {
      environment: 'jsdom',
      setupFiles: ['./test/setup.ts'],
    },
  };
});
