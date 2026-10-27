import { test, expect } from '../src/fixtures/base';

const viewports = [
  { name: 'móvil', width: 375, height: 667 },
  { name: 'escritorio', width: 1366, height: 768 },
];

const pages = [
  '/', '/login', '/register', '/inputs', '/checkboxes',
  '/dropdown', '/tables', '/js-dialogs', '/contact', '/about',
];

for (const vp of viewports) {
  test.describe(`Responsive · ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const path of pages) {
      test(`[RWD] ${path} se muestra correctamente en ${vp.name}`, async ({ page }) => {
        const res = await page.goto(path);
        expect(res?.status()).toBe(200);
        await expect(page.locator('h1').first()).toBeVisible();
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });
}
