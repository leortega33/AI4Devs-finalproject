import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'ChangeMe123!';
const DNI = String(Date.now()).slice(-8);

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
}

test.describe('progress', () => {
  test('records a measurement, shows the summary, and deletes it', async ({ page }) => {
    await login(page);

    // Create a client to attach progress to.
    await page.getByRole('link', { name: 'Clientes' }).click();
    await page.getByRole('button', { name: 'Nuevo cliente' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible();
    await page.getByLabel(/nombre/i).fill('Prog');
    await page.getByLabel(/apellido/i).fill('Reso');
    await page.getByLabel(/dni/i).fill(DNI);
    await page.getByLabel(/^teléfono(?! de)/i).fill('+542604000000');
    await page.getByLabel(/email/i).fill('prog@example.com');
    await page.getByLabel(/fecha de nacimiento/i).fill('1990-01-01');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Prog Reso')).toBeVisible();

    // Open the client's progress page.
    await page.getByRole('row', { name: /Prog Reso/ }).getByRole('button', { name: 'Progreso' }).click();
    await expect(page.getByRole('heading', { name: 'Progreso', exact: true })).toBeVisible();
    await expect(page.getByText(/todavía no tiene mediciones/i)).toBeVisible();

    // Record a measurement (weight only).
    await page.getByRole('button', { name: 'Registrar medición' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/peso \(kg\)/i).fill('80');
    await dialog.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Medición registrada.')).toBeVisible();

    // The entry appears and the summary updates.
    await expect(page.getByRole('cell', { name: '80', exact: true })).toBeVisible();
    const weightCard = page.getByText('Peso actual').locator('..');
    await expect(weightCard.getByText('80 kg')).toBeVisible();

    // Delete it.
    await page.getByRole('row', { name: /80/ }).getByRole('button', { name: 'Eliminar' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Medición eliminada.')).toBeVisible();
    await expect(page.getByText(/todavía no tiene mediciones/i)).toBeVisible();
  });
});
