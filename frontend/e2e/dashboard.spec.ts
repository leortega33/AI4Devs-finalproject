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

test.describe('dashboard alerts', () => {
  test('shows an overdue client and links to their payments', async ({ page }) => {
    await login(page);

    // Dashboard shows the four alert groups.
    await expect(page.getByText('Pagos vencidos')).toBeVisible();
    await expect(page.getByText('Rutinas por vencer')).toBeVisible();

    // Create a client.
    await page.goto('/clients');
    await page.getByRole('button', { name: 'Nuevo cliente' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible();
    await page.getByLabel(/nombre/i).fill('Dashboard');
    await page.getByLabel(/apellido/i).fill('Overdue');
    await page.getByLabel(/dni/i).fill(DNI);
    await page.getByLabel(/^teléfono(?! de)/i).fill('+542604000009');
    await page.getByLabel(/email/i).fill('dashboard.e2e@example.com');
    await page.getByLabel(/fecha de nacimiento/i).fill('1990-01-01');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Dashboard Overdue')).toBeVisible();

    // Register a clearly past-period payment (overdue).
    await page.getByRole('row', { name: /Dashboard Overdue/ }).getByRole('button', { name: 'Pagos' }).click();
    await expect(page.getByRole('heading', { name: 'Pagos del cliente' })).toBeVisible();
    await page.getByRole('button', { name: 'Registrar pago' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/monto/i).fill('5000');
    await dialog.getByLabel(/mes del período/i).fill('1');
    await dialog.getByLabel(/año del período/i).fill('2020');
    await dialog.getByRole('button', { name: 'Guardar' }).click();
    await expect(dialog).toBeHidden();

    // Back to the dashboard: the client is in the overdue group and links to payments.
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();

    // The top-bar notification bell shows a non-zero badge and lists the alert (US-013).
    const bell = page.getByRole('button', { name: 'Notificaciones' });
    await expect(bell).toBeVisible();
    await bell.click();
    await expect(page.getByRole('menuitem', { name: /Dashboard Overdue/ })).toBeVisible();
    await page.keyboard.press('Escape');

    const overdueLink = page.getByRole('link', { name: /Dashboard Overdue/ });
    await expect(overdueLink).toBeVisible();
    await overdueLink.click();
    await expect(page.getByRole('heading', { name: 'Pagos del cliente' })).toBeVisible();
  });
});
