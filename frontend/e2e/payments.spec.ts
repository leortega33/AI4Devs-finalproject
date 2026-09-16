import { test, expect } from '@playwright/test';
import fs from 'fs';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'ChangeMe123!';
const DNI = String(Date.now()).slice(-8);
const EXPORT_DNI = String(Date.now() + 1).slice(-8);
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

  test('export the payment history as a PDF', async ({ page }) => {
    await login(page);

    // Create a dedicated client.
    await page.goto('/clients');
    await page.getByRole('button', { name: 'Nuevo cliente' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible();
    await page.getByLabel(/nombre/i).fill('Export');
    await page.getByLabel(/apellido/i).fill('Cliente');
    await page.getByLabel(/dni/i).fill(EXPORT_DNI);
    await page.getByLabel(/^teléfono(?! de)/i).fill('+542604000001');
    await page.getByLabel(/email/i).fill('export.e2e@example.com');
    await page.getByLabel(/fecha de nacimiento/i).fill('1991-05-05');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Export Cliente')).toBeVisible();

    // Open its payments page and register a payment.
    await page.getByRole('row', { name: /Export Cliente/ }).getByRole('button', { name: 'Pagos' }).click();
    await expect(page.getByRole('heading', { name: 'Pagos del cliente' })).toBeVisible();
    await page.getByRole('button', { name: 'Registrar pago' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/monto/i).fill('7000');
    await dialog.getByLabel(/mes del período/i).fill(String(CURRENT_MONTH));
    await dialog.getByLabel(/año del período/i).fill(String(CURRENT_YEAR));
    await dialog.getByRole('button', { name: 'Guardar' }).click();
    await expect(dialog).toBeHidden();

    // Click "Exportar PDF" and verify a non-empty PDF download is triggered.
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar PDF' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    expect(fs.statSync(filePath as string).size).toBeGreaterThan(0);
  });
});
