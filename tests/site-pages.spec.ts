import { test, expect } from '../src/fixtures/base';
import { corePages, extraPages } from '../src/data/pages';

/**
 * Smoke masivo: valida que cada página del sitio cargue y tenga la estructura básica.
 * - corePages  → 1 prueba por página (carga + estructura)
 * - extraPages → 1 prueba por página (carga)
 */
test.describe('Smoke · páginas estándar', () => {
  for (const p of corePages) {
    test(`[PAGE] ${p.name} (${p.path}) carga con título, h1, navbar y footer`, async ({ page }) => {
      const res = await page.goto(p.path);
      expect(res?.status(), `status de ${p.path}`).toBe(200);
      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Test Cases' }).first()).toBeVisible();
      await expect(page.getByText(/Copyright/i).first()).toBeVisible();
    });
  }
});

test.describe('Smoke · apps, herramientas y aserciones', () => {
  for (const p of extraPages) {
    test(`[LOAD] ${p.name} (${p.path}) carga correctamente`, async ({ page }) => {
      const res = await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      expect(res?.status(), `status de ${p.path}`).toBeLessThan(400);
      await expect(page).toHaveTitle(/.+/);
    });
  }
});
