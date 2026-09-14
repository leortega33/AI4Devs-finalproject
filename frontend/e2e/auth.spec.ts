import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'ChangeMe123!';

test.describe('admin authentication', () => {
  test('unauthenticated visit to a protected route redirects to login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('invalid login shows an error message', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/contraseña/i).fill('wrong-password');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.getByText(/email o contraseña inválidos/i)).toBeVisible();
  });

  test('valid login lands on the protected dashboard, then logout returns to login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.getByText(new RegExp(`sesión iniciada como ${ADMIN_EMAIL}`, 'i'))).toBeVisible();

    await page.getByRole('button', { name: /cerrar sesión/i }).click();
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();

    // After logout, the protected route should redirect back to login.
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('forgot-password flow shows a generic confirmation', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByRole('button', { name: /enviar enlace/i }).click();

    await expect(page.getByText(/se envió un enlace/i)).toBeVisible();
  });

  test('app shell shows the branded bar and back navigation works', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();

    // Branded app bar is present on authenticated screens.
    await expect(page.getByRole('banner').getByText('SPORT – FITNESS')).toBeVisible();

    // Navigate into clients, then use the back button to return home.
    await page.getByRole('button', { name: 'Clientes' }).click();
    await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();
    await page.getByRole('button', { name: /atrás/i }).click();
    await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
  });
});
