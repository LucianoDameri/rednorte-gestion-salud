/**
 * E2E: flujo de autenticación (login / logout)
 */
import { test, expect } from '@playwright/test';

test.describe('Login / Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
  });

  test('muestra la pantalla de login al acceder sin sesión', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText('SaludRedNorte')).toBeVisible();
  });

  test('muestra el formulario de login correctamente', async ({ page }) => {
    await expect(page.getByTestId('input-username')).toBeVisible();
    await expect(page.getByTestId('input-password')).toBeVisible();
    await expect(page.getByTestId('btn-login')).toBeVisible();
  });

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.getByTestId('input-username').fill('usuario_malo');
    await page.getByTestId('input-password').fill('password_malo');
    await page.getByTestId('btn-login').click();

    await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 5000 });
  });

  test('login exitoso como recepcionista redirige al panel', async ({ page }) => {
    await page.getByTestId('input-username').fill('recepcionista');
    await page.getByTestId('input-password').fill('rec123');
    await page.getByTestId('btn-login').click();

    // Debe redirigir al home (pacientes)
    await expect(page).not.toHaveURL(/.*login/, { timeout: 8000 });
    await expect(page.getByText('Pacientes')).toBeVisible();
  });

  test('login exitoso como médico muestra lista de espera', async ({ page }) => {
    await page.getByTestId('input-username').fill('dr.garcia');
    await page.getByTestId('input-password').fill('med123');
    await page.getByTestId('btn-login').click();

    await expect(page).not.toHaveURL(/.*login/, { timeout: 8000 });
    await expect(page.getByText('Lista de Espera')).toBeVisible();
  });

  test('logout limpia la sesión y redirige al login', async ({ page }) => {
    // Login primero
    await page.getByTestId('input-username').fill('recepcionista');
    await page.getByTestId('input-password').fill('rec123');
    await page.getByTestId('btn-login').click();
    await expect(page).not.toHaveURL(/.*login/, { timeout: 8000 });

    // Logout
    await page.getByTestId('btn-logout').click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('acceso a ruta protegida sin sesión redirige a login', async ({ page }) => {
    await page.goto('/solicitudes');
    await expect(page).toHaveURL(/.*login/);
  });
});
