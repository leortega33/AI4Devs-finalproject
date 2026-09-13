import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'ChangeMe123!';

test.describe('admin authentication', () => {
  test('unauthenticated visit to a protected route redirects to login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
  });

  test('invalid login shows an error message', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill('wrong-password');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('valid login lands on the protected dashboard, then logout returns to login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page.getByText(new RegExp(`logged in as ${ADMIN_EMAIL}`, 'i'))).toBeVisible();

    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();

    // After logout, the protected route should redirect back to login.
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
  });

  test('forgot-password flow shows a generic confirmation', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByRole('button', { name: /send reset link/i }).click();

    await expect(page.getByText(/reset link was sent/i)).toBeVisible();
  });
});
