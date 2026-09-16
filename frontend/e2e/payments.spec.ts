import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'ChangeMe123!';
const DNI = String(Date.now()).slice(-8);
const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
}

test.describe('client payments', () => {
  test('register, list, and reflect the payment status', async ({ page }) => {
    await login(page);

    // Create a client.
    await page.goto('/clients');
    await page.getByRole('button', { name: 'Nuevo cliente' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible();
    await page.getByLabel(/nombre/i).fill('Pago');
    await page.getByLabel(/apellido/i).fill('Cliente');
    await page.getByLabel(/dni/i).fill(DNI);
    await page.getByLabel(/^teléfono(?! de)/i).fill('+542604000000');
    await page.getByLabel(/email/i).fill('pago@example.com');
    await page.getByLabel(/fecha de nacimiento/i).fill('1990-01-01');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Pago Cliente')).toBeVisible();

    // Client list shows "Sin pagos" for the new client.
    await expect(
      page.getByRole('row', { name: /Pago Cliente/ }).getByText('Sin pagos'),
    ).toBeVisible();

    // Open the payments page.
    await page.getByRole('row', { name: /Pago Cliente/ }).getByRole('button', { name: 'Pagos' }).click();
    await expect(page.getByRole('heading', { name: 'Pagos del cliente' })).toBeVisible();
    await expect(page.getByText(/todavía no tiene pagos registrados/i)).toBeVisible();

    // Register a current-month payment (up to date).
    await page.getByRole('button', { name: 'Registrar pago' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const amount = dialog.getByLabel(/monto/i);
    await amount.fill('5000');
    await dialog.getByLabel(/mes del período/i).fill(String(CURRENT_MONTH));
    await dialog.getByLabel(/año del período/i).fill(String(CURRENT_YEAR));
    await dialog.getByRole('button', { name: 'Guardar' }).click();
    await expect(dialog).toBeHidden();

    // The payment appears and the status chip shows "Al día".
    await expect(page.getByText(`${String(CURRENT_MONTH).padStart(2, '0')}/${CURRENT_YEAR}`)).toBeVisible();
    await expect(page.getByText('Al día')).toBeVisible();

    // Back to the client list: the indicator now shows "Al día".
    await page.getByRole('button', { name: /atrás/i }).click();
    await expect(
      page.getByRole('row', { name: /Pago Cliente/ }).getByText('Al día'),
    ).toBeVisible();
  });
});
