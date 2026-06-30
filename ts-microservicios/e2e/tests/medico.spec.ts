/**
 * E2E: flujo del Médico
 * - Ve lista de espera como página principal
 * - Puede marcar pacientes como ATENDIDA/CANCELADA
 * - NO puede crear/eliminar pacientes
 * - NO puede crear solicitudes (no tiene esa navegación)
 */
import { test, expect, Page } from '@playwright/test';

async function loginMedico(page: Page, user = 'dr.garcia', pass = 'med123') {
  await page.evaluate(() => localStorage.clear());
  await page.goto('/login');
  await page.getByTestId('input-username').fill(user);
  await page.getByTestId('input-password').fill(pass);
  await page.getByTestId('btn-login').click();
  await expect(page).not.toHaveURL(/.*login/, { timeout: 8000 });
}

test.describe('Médico - Acceso y navegación', () => {
  test.beforeEach(async ({ page }) => { await loginMedico(page); });

  test('la página principal del médico es Lista de Espera', async ({ page }) => {
    await expect(page.getByText('⏳ Lista de Espera')).toBeVisible();
  });

  test('muestra el nombre y rol del médico en el header', async ({ page }) => {
    await expect(page.getByText(/Dr\. Carlos García/)).toBeVisible();
    await expect(page.getByText(/Médico/)).toBeVisible();
  });

  test('NO tiene la opción de Solicitudes en el menú', async ({ page }) => {
    await expect(page.getByText('📋 Solicitudes')).not.toBeVisible();
  });

  test('SÍ tiene la opción de Ver Pacientes (modo lectura)', async ({ page }) => {
    await expect(page.getByText('🧑‍🤝‍🧑 Ver Pacientes')).toBeVisible();
  });

  test('puede acceder a ver pacientes', async ({ page }) => {
    await page.getByText('🧑‍🤝‍🧑 Ver Pacientes').click();
    await expect(page.getByText('Modo solo lectura')).toBeVisible();
  });

  test('NO puede ver el botón de Nuevo Paciente en modo lectura', async ({ page }) => {
    await page.getByText('🧑‍🤝‍🧑 Ver Pacientes').click();
    await expect(page.getByTestId('btn-nuevo-paciente')).not.toBeVisible();
  });
});

test.describe('Médico - Lista de Espera', () => {
  test.beforeEach(async ({ page }) => { await loginMedico(page); });

  test('ve el indicador de "Vista médico"', async ({ page }) => {
    await expect(page.getByText(/Vista médico/)).toBeVisible();
  });

  test('tiene filtros de estado y prioridad', async ({ page }) => {
    await expect(page.getByText('Todos los estados')).toBeVisible();
    await expect(page.getByText('Todas las prioridades')).toBeVisible();
  });

  test('la lista carga sin errores', async ({ page }) => {
    await page.waitForTimeout(1500);
    // No debe haber errores de red visibles
    await expect(page.getByText('Error')).not.toBeVisible();
  });
});

test.describe('Médico - Restricciones de acceso', () => {
  test.beforeEach(async ({ page }) => { await loginMedico(page); });

  test('acceder a /solicitudes redirige al home del médico', async ({ page }) => {
    await page.goto('/solicitudes');
    // El médico no tiene esa ruta → lo manda al home (lista espera)
    await expect(page).not.toHaveURL(/solicitudes/);
  });

  test('dr.lopez también puede iniciar sesión', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await loginMedico(page, 'dr.lopez', 'med456');
    await expect(page.getByText(/Dra\. Ana López/)).toBeVisible();
  });
});
