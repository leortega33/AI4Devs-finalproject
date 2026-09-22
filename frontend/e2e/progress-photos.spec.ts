import { test, expect } from '@playwright/test';
import path from 'path';

const PHOTO = path.join(process.cwd(), 'e2e', 'fixtures', 'progress-photo.png');

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

test.describe('progress photos', () => {
  test('records a photo-only entry, shows the thumbnail, and deletes the photo', async ({ page }) => {
    await login(page);

    // Create a client to attach progress to.
    await page.getByRole('link', { name: 'Clientes' }).click();
    await page.getByRole('button', { name: 'Nuevo cliente' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible();
    await page.getByLabel(/nombre/i).fill('Foto');
    await page.getByLabel(/apellido/i).fill('Progreso');
    await page.getByLabel(/dni/i).fill(DNI);
    await page.getByLabel(/^teléfono(?! de)/i).fill('+542604000000');
    await page.getByLabel(/email/i).fill('fotoprog@example.com');
    await page.getByLabel(/fecha de nacimiento/i).fill('1990-01-01');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Foto Progreso')).toBeVisible();

    // Open the client's progress page.
    await page.getByRole('row', { name: /Foto Progreso/ }).getByRole('button', { name: 'Progreso' }).click();
    await expect(page.getByRole('heading', { name: 'Progreso', exact: true })).toBeVisible();

    // Record a photo-only entry.
    await page.getByRole('button', { name: 'Registrar medición' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Agregar fotos' }).locator('input[type="file"]').setInputFiles(PHOTO);
    await dialog.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Medición registrada.')).toBeVisible();

    // The thumbnail appears.
    const thumbnail = page.getByRole('img', { name: 'Foto de progreso' });
    await expect(thumbnail.first()).toBeVisible();

    // Delete the photo with confirmation.
    await page.getByRole('button', { name: 'Eliminar foto' }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Foto eliminada.')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Foto de progreso' })).toHaveCount(0);
  });
});
