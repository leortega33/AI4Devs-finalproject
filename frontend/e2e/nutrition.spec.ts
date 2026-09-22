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

test.describe('nutrition', () => {
  test('saves a plan with a meal and food item, persists it, and shows history', async ({ page }) => {
    await login(page);

    // Create a client to attach a plan to.
    await page.getByRole('link', { name: 'Clientes' }).click();
    await page.getByRole('button', { name: 'Nuevo cliente' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible();
    await page.getByLabel(/nombre/i).fill('Nutri');
    await page.getByLabel(/apellido/i).fill('Plan');
    await page.getByLabel(/dni/i).fill(DNI);
    await page.getByLabel(/^teléfono(?! de)/i).fill('+542604000000');
    await page.getByLabel(/email/i).fill('nutri@example.com');
    await page.getByLabel(/fecha de nacimiento/i).fill('1990-01-01');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Nutri Plan')).toBeVisible();

    // Open the client's nutrition page.
    await page.getByRole('row', { name: /Nutri Plan/ }).getByRole('button', { name: 'Nutrición' }).click();
    await expect(page.getByRole('heading', { name: 'Nutrición', exact: true })).toBeVisible();

    // Set a target, add a meal + food item, and save.
    await page.getByLabel('Calorías diarias').fill('2200');
    await page.getByRole('button', { name: 'Agregar comida' }).click();
    const mealCard = page.getByTestId('meal-card').first();
    await mealCard.getByLabel('Nombre de la comida').fill('Desayuno');
    await mealCard.getByRole('button', { name: 'Agregar alimento' }).click();
    await mealCard.getByLabel('Alimento', { exact: true }).fill('Avena');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Plan de nutrición guardado.')).toBeVisible();

    // Reload and confirm it persists.
    await page.reload();
    await expect(page.getByLabel('Nombre de la comida')).toHaveValue('Desayuno');
    await expect(page.getByLabel('Alimento', { exact: true })).toHaveValue('Avena');
    await expect(page.getByLabel('Calorías diarias')).toHaveValue('2200');

    // Open the history and confirm a version is listed.
    await page.getByRole('button', { name: 'Historial' }).click();
    await expect(page.getByText('1 comida(s)')).toBeVisible();
  });
});
