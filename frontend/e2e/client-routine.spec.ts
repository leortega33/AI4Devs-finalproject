import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'ChangeMe123!';
const stamp = Date.now();
const DNI = String(stamp).slice(-8);
const TPL1 = `Plantilla E2E A ${stamp}`;
const TPL2 = `Plantilla E2E B ${stamp}`;

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
}

async function buildTemplate(page: import('@playwright/test').Page, name: string) {
  await page.goto('/routines');
  await page.getByRole('button', { name: 'Nueva rutina' }).click();
  await expect(page.getByRole('heading', { name: 'Nueva rutina' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Nombre', exact: true }).fill(name);
  await page.getByRole('textbox', { name: /nombre de la sesión/i }).fill('Sesión A');
  await page.getByRole('button', { name: 'Agregar ejercicio' }).nth(1).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText('Sentadilla').click();
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText(name)).toBeVisible();
}

test.describe('assign client routine', () => {
  test('assign a routine to a client and rotate the active one', async ({ page }) => {
    await login(page);

    // Create a client.
    await page.goto('/clients');
    await page.getByRole('button', { name: 'Nuevo cliente' }).click();
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible();
    await page.getByLabel(/nombre/i).fill('Asign');
    await page.getByLabel(/apellido/i).fill('Cliente');
    await page.getByLabel(/dni/i).fill(DNI);
    await page.getByLabel(/^teléfono(?! de)/i).fill('+542604000000');
    await page.getByLabel(/email/i).fill('asign@example.com');
    await page.getByLabel(/fecha de nacimiento/i).fill('1990-01-01');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Asign Cliente')).toBeVisible();

    // Give the client a knee injury so the advisory medical warning can appear (US-022).
    await page.getByRole('row', { name: /Asign Cliente/ }).getByRole('button', { name: 'Ficha médica' }).click();
    await expect(page.getByRole('heading', { name: 'Ficha médica' })).toBeVisible();
    await page.getByLabel(/lesiones/i).fill('Lesión de rodilla');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Ficha médica guardada.')).toBeVisible();

    // Build two library templates.
    await buildTemplate(page, TPL1);
    await buildTemplate(page, TPL2);

    // Open the client's routine page.
    await page.goto('/clients');
    await page
      .getByRole('row', { name: /Asign Cliente/ })
      .getByRole('button', { name: 'Rutina' })
      .click();
    await expect(page.getByRole('heading', { name: 'Rutina del cliente' })).toBeVisible();
    await expect(page.getByText(/todavía no tiene una rutina asignada/i)).toBeVisible();

    // Assign the first template.
    await page.getByRole('button', { name: 'Elegir plantilla' }).click();
    await page.getByRole('dialog').getByText(TPL1).click();
    await page.getByLabel(/fecha de inicio/i).fill('2026-02-01');
    await page.getByRole('button', { name: /^asignar rutina$/i }).click();
    await expect(page.getByText('Rutina activa')).toBeVisible();
    await expect(page.getByText(/todavía no tiene una rutina asignada/i)).toHaveCount(0);

    // The Sentadilla entry shows the advisory medical warning (knee overlap, US-022).
    await expect(page.getByLabel('Aviso médico').first()).toBeVisible();

    // The suggested warm-up panel lists mobility/activation work for the flagged knee (US-023).
    await expect(page.getByRole('heading', { name: 'Calentamiento sugerido' })).toBeVisible();
    await expect(page.getByText('Caminata lateral con banda')).toBeVisible();

    // Assign the second template: the first moves to history (only one active).
    await page.getByRole('button', { name: /Elegir plantilla|Plantilla E2E/ }).first().click();
    await page.getByRole('dialog').getByText(TPL2).click();
    await page.getByLabel(/fecha de inicio/i).fill('2026-03-01');
    await page.getByRole('button', { name: /^asignar rutina$/i }).click();

    // History now lists the previous routine.
    await expect(page.getByText('Historial de rutinas')).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: TPL1 })).toBeVisible();
  });
});
