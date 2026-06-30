import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

<<<<<<< HEAD
// En Docker, el proxy del servidor Vite necesita apuntar al nombre del contenedor BFF.
// Localmente sigue apuntando a localhost:3000.
const BFF_TARGET = process.env.BFF_TARGET || 'http://localhost:3000';

=======
// El frontend solo habla con el BFF (puerto 3000).
// El BFF es quien sabe cómo hablar con cada microservicio.
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
<<<<<<< HEAD
    host: true, // necesario para que Docker exponga el puerto
    proxy: {
      '/bff': { target: BFF_TARGET, changeOrigin: true },
      '/auth': { target: BFF_TARGET, changeOrigin: true },
      '/health': { target: BFF_TARGET, changeOrigin: true },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/**/*.d.ts'],
      thresholds: { lines: 60, functions: 60, branches: 60, statements: 60 },
=======
    proxy: {
      '/bff': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
    },
  },
});
