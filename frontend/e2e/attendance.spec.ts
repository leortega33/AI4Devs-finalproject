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

test.describe('attendance', () => {
  test('records a check-in, shows the summary, and deletes it', async ({ page }) => {
    await login(page);

    // Create a client to attach attendance to.
    await page.getByRole('link', { name: 'Clientes' }).click();
    await page.getByRole('button', { name: 'Nuevo cliente' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible();
    await page.getByLabel(/nombre/i).fill('Asis');
    await page.getByLabel(/apellido/i).fill('Tencia');
    await page.getByLabel(/dni/i).fill(DNI);
    await page.getByLabel(/^teléfono(?! de)/i).fill('+542604000000');
    await page.getByLabel(/email/i).fill('asis@example.com');
    await page.getByLabel(/fecha de nacimiento/i).fill('1990-01-01');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Asis Tencia')).toBeVisible();

    // Open the client's attendance page.
    await page.getByRole('row', { name: /Asis Tencia/ }).getByRole('button', { name: 'Asistencia' }).click();
    await expect(page.getByRole('heading', { name: 'Asistencia', exact: true })).toBeVisible();
    await expect(page.getByText(/todavía no tiene asistencias/i)).toBeVisible();

    // Register a check-in with a note.
    await page.getByRole('button', { name: 'Registrar asistencia' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/nota/i).fill('Entrenó fuerte');
    await dialog.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Asistencia registrada.')).toBeVisible();

    // The check-in appears and the summary updates.
    await expect(page.getByRole('cell', { name: 'Entrenó fuerte' })).toBeVisible();
    const totalCard = page.getByText('Total', { exact: true }).locator('..');
    await expect(totalCard.getByText('1')).toBeVisible();

    // Delete it.
    await page.getByRole('row', { name: /Entrenó fuerte/ }).getByRole('button', { name: 'Eliminar' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Asistencia eliminada.')).toBeVisible();
    await expect(page.getByText(/todavía no tiene asistencias/i)).toBeVisible();
  });
});
