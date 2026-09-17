import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'ChangeMe123!';
const DNI = String(Date.now()).slice(-8); // unique per run

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
}

test.describe('client management', () => {
  test('create, edit, filter and deactivate a client', async ({ page }) => {
    await login(page);

    // Go to clients
    await page.getByRole('link', { name: 'Clientes' }).click();
    await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();

    // Create
    await page.getByRole('button', { name: 'Nuevo cliente' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible();
    await page.getByLabel(/nombre/i).fill('E2E');
    await page.getByLabel(/apellido/i).fill('Tester');
    await page.getByLabel(/dni/i).fill(DNI);
    await page.getByLabel(/^teléfono(?! de)/i).fill('+542604000000');
    await page.getByLabel(/email/i).fill('e2e@example.com');
    await page.getByLabel(/fecha de nacimiento/i).fill('1990-01-01');
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page.getByText('E2E Tester')).toBeVisible();

    // Edit (scoped to the E2E Tester row so other clients in the list don't interfere)
    await page.getByRole('row', { name: /E2E Tester/ }).getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel(/^teléfono(?! de)/i).fill('+542604111111');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('E2E Tester')).toBeVisible();

    // Deactivate (confirmation dialog), scoped to the E2E Tester row
    await page.getByRole('row', { name: /E2E Tester/ }).getByRole('button', { name: 'Desactivar' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Desactivar' }).click();
    await expect(page.getByText('Inactivo')).toBeVisible();

    // Filter by inactive status keeps it visible
    await page.getByRole('combobox', { name: /estado/i }).click();
    await page.getByRole('option', { name: 'Inactivo' }).click();
    await expect(page.getByText('E2E Tester')).toBeVisible();
  });
});
