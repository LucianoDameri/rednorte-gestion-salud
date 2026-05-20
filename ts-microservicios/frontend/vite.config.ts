import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El frontend solo habla con el BFF (puerto 3000).
// El BFF es quien sabe cómo hablar con cada microservicio.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/bff': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
