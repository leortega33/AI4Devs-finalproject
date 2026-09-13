import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'ChangeMe123!';
const DNI = String(Date.now()).slice(-8); // unique per run

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page.getByRole('heading', { name: 'Gym Management' })).toBeVisible();
}

test.describe('client management', () => {
  test('create, edit, filter and deactivate a client', async ({ page }) => {
    await login(page);

    // Go to clients
    await page.getByRole('button', { name: 'Clients' }).click();
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();

    // Create
    await page.getByRole('button', { name: 'New client' }).click();
    await page.getByLabel(/first name/i).fill('E2E');
    await page.getByLabel(/last name/i).fill('Tester');
    await page.getByLabel(/dni/i).fill(DNI);
    await page.getByLabel(/^phone/i).fill('+542604000000');
    await page.getByLabel(/email/i).fill('e2e@example.com');
    await page.getByLabel(/birth date/i).fill('1990-01-01');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('E2E Tester')).toBeVisible();

    // Edit
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await page.getByLabel(/^phone/i).fill('+542604111111');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('E2E Tester')).toBeVisible();

    // Deactivate (confirmation dialog)
    await page.getByRole('button', { name: 'Deactivate' }).first().click();
    await page.getByRole('button', { name: 'Deactivate' }).last().click();
    await expect(page.getByText('inactive')).toBeVisible();

    // Filter by inactive status keeps it visible
    await page.getByRole('combobox', { name: /status/i }).click();
    await page.getByRole('option', { name: 'Inactive' }).click();
    await expect(page.getByText('E2E Tester')).toBeVisible();
  });
});
