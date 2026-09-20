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

test.describe('medical record', () => {
  test('shows empty state, saves, and persists the medical record', async ({ page }) => {
    await login(page);

    // Create a client to attach the medical record to.
    await page.getByRole('link', { name: 'Clientes' }).click();
    await page.getByRole('button', { name: 'Nuevo cliente' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible();
    await page.getByLabel(/nombre/i).fill('Med');
    await page.getByLabel(/apellido/i).fill('Tester');
    await page.getByLabel(/dni/i).fill(DNI);
    await page.getByLabel(/^teléfono(?! de)/i).fill('+542604000000');
    await page.getByLabel(/email/i).fill('med@example.com');
    await page.getByLabel(/fecha de nacimiento/i).fill('1990-05-05');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Med Tester')).toBeVisible();

    // Open the medical record and verify the empty state.
    await page.getByRole('button', { name: 'Ficha médica' }).first().click();
    await expect(page.getByRole('heading', { name: 'Ficha médica' })).toBeVisible();
    await expect(page.getByText(/todavía no tiene ficha médica/i)).toBeVisible();

    // Fill in and save.
    await page.getByLabel(/alergias/i).fill('Penicilina');
    await page.getByLabel(/grupo sanguíneo/i).fill('O+');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Ficha médica guardada.')).toBeVisible();

    // Reopen from the list and verify persistence (no empty state).
    await page.getByRole('button', { name: /atrás/i }).click();
    await expect(page.getByRole('heading', { name: 'Clientes', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Ficha médica' }).first().click();
    await expect(page.getByLabel(/grupo sanguíneo/i)).toHaveValue('O+');
    await expect(page.getByText(/todavía no tiene ficha médica/i)).toHaveCount(0);

    // Edit and verify the change persists.
    await page.getByLabel(/medicación/i).fill('Ibuprofeno');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Ficha médica guardada.')).toBeVisible();
    await page.reload();
    await expect(page.getByLabel(/medicación/i)).toHaveValue('Ibuprofeno');
  });
});
