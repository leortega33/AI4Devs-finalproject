import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'ChangeMe123!';
const ROUTINE = `Rutina E2E ${Date.now()}`;

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
}

test.describe('routine templates', () => {
  test('build, list, edit and duplicate a routine template', async ({ page }) => {
    await login(page);

    // Open the routines library from the dashboard.
    await page.getByRole('link', { name: 'Rutinas' }).click();
    await expect(page.getByRole('heading', { name: 'Rutinas' })).toBeVisible();

    // Build a new routine with a session and a main exercise from the picker.
    await page.getByRole('button', { name: 'Nueva rutina' }).click();
    await expect(page.getByRole('heading', { name: 'Nueva rutina' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Nombre', exact: true }).fill(ROUTINE);
    await page.getByRole('textbox', { name: /nombre de la sesión/i }).fill('Sesión A');

    // Add a main-phase exercise via the picker dialog.
    await page.getByRole('button', { name: 'Agregar ejercicio' }).nth(1).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByText('Sentadilla').click();
    await expect(dialog).toBeHidden();

    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(ROUTINE)).toBeVisible();

    // Export the routine as PDF and Excel — both trigger a download.
    const row = page.getByRole('row', { name: new RegExp(ROUTINE) });
    const [pdfDownload] = await Promise.all([
      page.waitForEvent('download'),
      row.getByRole('button', { name: 'Exportar PDF' }).click(),
    ]);
    expect(pdfDownload.suggestedFilename()).toMatch(/routine-\d+\.pdf/);
    const [xlsxDownload] = await Promise.all([
      page.waitForEvent('download'),
      row.getByRole('button', { name: 'Exportar Excel' }).click(),
    ]);
    expect(xlsxDownload.suggestedFilename()).toMatch(/routine-\d+\.xlsx/);

    // Duplicate it and verify a copy appears.
    await page.getByRole('row', { name: new RegExp(ROUTINE) }).getByRole('button', { name: 'Duplicar' }).click();
    await expect(page.getByText(`${ROUTINE} (copia)`)).toBeVisible();

    // Edit the original and verify persistence.
    await page.getByRole('row', { name: new RegExp(`${ROUTINE}(?! \\(copia\\))`) }).getByRole('button', { name: 'Editar' }).first().click();
    await expect(page.getByRole('heading', { name: 'Editar rutina' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Objetivo' }).fill('Fuerza');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText(ROUTINE, { exact: true })).toBeVisible();
  });
});
