import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'ChangeMe123!';
const EX_NAME = `E2E Exercise ${Date.now()}`;

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
}

test.describe('exercise catalog', () => {
  test('lists seeded exercises, creates, filters and edits an exercise', async ({ page }) => {
    await login(page);

    // Open the catalog from the dashboard.
    await page.getByRole('link', { name: 'Ejercicios' }).click();
    await expect(page.getByRole('heading', { name: 'Ejercicios' })).toBeVisible();
    // Seeded exercise is present.
    await expect(page.getByText('Sentadilla')).toBeVisible();

    // Create a new exercise.
    await page.getByRole('button', { name: 'Nuevo ejercicio' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo ejercicio' })).toBeVisible();
    await page.getByLabel(/nombre/i).fill(EX_NAME);
    await page.getByLabel(/grupo muscular/i).fill('Legs');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(EX_NAME)).toBeVisible();

    // Filter by category (main) keeps it visible.
    await page.getByRole('combobox', { name: /categoría/i }).click();
    await page.getByRole('option', { name: 'Principal' }).click();
    await expect(page.getByText(EX_NAME)).toBeVisible();

    // Edit the exercise.
    await page.getByRole('row', { name: new RegExp(EX_NAME) }).getByRole('button', { name: 'Editar' }).click();
    await expect(page.getByRole('heading', { name: 'Editar ejercicio' })).toBeVisible();
    await page.getByLabel(/equipamiento/i).fill('Dumbbell');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(EX_NAME)).toBeVisible();
  });
});
