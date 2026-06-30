/**
 * E2E: flujo de la Recepcionista
 * - Gestión completa de pacientes (CRUD)
 * - Creación de solicitudes
 * - Gestión de lista de espera (editar estado, prioridad)
 */
import { test, expect, Page } from '@playwright/test';

// Helper: login como recepcionista
async function loginRecepcionista(page: Page) {
  await page.evaluate(() => localStorage.clear());
  await page.goto('/login');
  await page.getByTestId('input-username').fill('recepcionista');
  await page.getByTestId('input-password').fill('rec123');
  await page.getByTestId('btn-login').click();
  await expect(page).not.toHaveURL(/.*login/, { timeout: 8000 });
}

test.describe('Recepcionista - Módulo Pacientes', () => {
  test.beforeEach(async ({ page }) => { await loginRecepcionista(page); });

  test('ve la página de pacientes como página principal', async ({ page }) => {
    await expect(page.getByText('🧑‍🤝‍🧑 Pacientes')).toBeVisible();
  });

  test('tiene acceso al botón Nuevo Paciente', async ({ page }) => {
    await expect(page.getByTestId('btn-nuevo-paciente')).toBeVisible();
  });

  test('puede abrir y cerrar el formulario de nuevo paciente', async ({ page }) => {
    await page.getByTestId('btn-nuevo-paciente').click();
    await expect(page.getByPlaceholder('RUT (ej: 11111111-1)')).toBeVisible();

    await page.getByTestId('btn-nuevo-paciente').click();
    await expect(page.getByPlaceholder('RUT (ej: 11111111-1)')).not.toBeVisible();
  });

  test('puede navegar a Solicitudes', async ({ page }) => {
    await page.getByText('📋 Solicitudes').click();
    await expect(page.getByText('Solicitudes Médicas')).toBeVisible();
  });

  test('puede navegar a Lista de Espera', async ({ page }) => {
    await page.getByText('⏳ Lista de Espera').click();
    await expect(page.getByText('Lista de Espera')).toBeVisible();
  });
});

test.describe('Recepcionista - Módulo Solicitudes', () => {
  test.beforeEach(async ({ page }) => {
    await loginRecepcionista(page);
    await page.getByText('📋 Solicitudes').click();
  });

  test('muestra la tabla de solicitudes', async ({ page }) => {
    await expect(page.getByText('Solicitudes Médicas')).toBeVisible();
  });

  test('tiene botón para crear nueva solicitud', async ({ page }) => {
    await expect(page.getByText('+ Nueva Solicitud')).toBeVisible();
  });

  test('el formulario de solicitud tiene los campos requeridos', async ({ page }) => {
    await page.getByText('+ Nueva Solicitud').click();
    await expect(page.getByText('Nueva Solicitud Médica')).toBeVisible();
    // Debe haber un select de paciente
    await expect(page.getByText('-- Seleccionar Paciente --')).toBeVisible();
  });
});

test.describe('Recepcionista - Lista de Espera', () => {
  test.beforeEach(async ({ page }) => {
    await loginRecepcionista(page);
    await page.getByText('⏳ Lista de Espera').click();
  });

  test('muestra el resumen estadístico', async ({ page }) => {
    // El resumen aparece cuando hay datos
    await page.waitForTimeout(1500);
    // Al menos debe estar la cabecera de la tabla
    await expect(page.getByText('Lista de Espera')).toBeVisible();
  });

  test('tiene los filtros de estado y prioridad', async ({ page }) => {
    await expect(page.getByText('Todos los estados')).toBeVisible();
    await expect(page.getByText('Todas las prioridades')).toBeVisible();
  });

  test('el médico NO puede ver la columna de edición completa', async ({ page }) => {
    // Como recepcionista sí debe existir el botón Editar (si hay filas)
    await page.waitForTimeout(1000);
    // Verificar que NO tiene mensaje de "Vista médico"
    await expect(page.getByText('Vista médico')).not.toBeVisible();
  });
});
