import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración Playwright - SaludRedNorte E2E
 * Prerequisito: frontend en :5173, BFF en :3000, microservicios corriendo.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 1,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Servidor de desarrollo (si se quiere arrancar automático)
  // webServer: {
  //   command: 'cd ../frontend && npm run dev',
  //   port: 5173,
  //   reuseExistingServer: true,
  // },
});
