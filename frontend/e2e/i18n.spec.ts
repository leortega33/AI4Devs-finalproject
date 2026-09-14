import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'ChangeMe123!';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
}

// Browser locale is es-AR (see playwright.config.ts), so the app defaults to Spanish.
test.describe('internationalization', () => {
  test('defaults to Spanish, switches to English, and persists across reload', async ({ page }) => {
    await login(page);

    // Default Spanish
    await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();

    // Switch to English via the in-app switcher (option labelled "Inglés" in Spanish)
    await page.getByRole('combobox', { name: /idioma/i }).click();
    await page.getByRole('option', { name: 'Inglés' }).click();

    await expect(page.getByRole('button', { name: 'Clients' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();

    // Persist across reload
    await page.reload();
    await expect(page.getByRole('button', { name: 'Clients' })).toBeVisible();
  });
});
