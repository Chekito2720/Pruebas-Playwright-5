import { test, expect } from '../src/fixtures/base';

test.describe('Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[HOME-01] el título contiene "Automation Testing Practice"', async ({ page }) => {
    await expect(page).toHaveTitle(/Automation Testing Practice/i);
  });

  test('[HOME-02] el h1 principal es visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: /Automation Testing Practice/i }),
    ).toBeVisible();
  });

  for (const link of ['Tips', 'Test Cases', 'API Testing', 'About']) {
    test(`[HOME-NAV] el menú principal tiene el enlace "${link}"`, async ({ page }) => {
      await expect(page.getByRole('link', { name: link, exact: true }).first()).toBeVisible();
    });
  }

  const sections = [
    'Sample applications for practice test automation',
    'Apps for Automation Testing Practice Exercises',
    'REST APIs for Automation Testing Practice Exercises',
    'Assertions for Automation Testing Practice Exercises',
    'Reports Examples',
    'Tools for QA and SDET Engineers',
  ];
  for (const s of sections) {
    test(`[HOME-SEC] existe la sección "${s}"`, async ({ page }) => {
      await expect(page.getByRole('heading', { name: s })).toBeVisible();
    });
  }

  test('[HOME-03] hay más de 60 tarjetas con enlace "Try it out"', async ({ page }) => {
    expect(await page.getByRole('link', { name: 'Try it out' }).count()).toBeGreaterThan(60);
  });

  const cards: Array<[string, string]> = [
    ['/inputs', 'Web inputs'],
    ['/login', 'Login'],
    ['/register', 'Register'],
    ['/forgot-password', 'Forgot password'],
    ['/dynamic-table', 'Dynamic table'],
    ['/checkboxes', 'Checkboxes'],
    ['/dropdown', 'Dropdown'],
    ['/js-dialogs', 'JavaScript dialogs'],
    ['/hovers', 'Hovers'],
    ['/iframe', 'IFrame'],
    ['/tables', 'Sortable tables'],
    ['/dynamic-controls', 'Dynamic controls'],
  ];
  for (const [href, name] of cards) {
    test(`[HOME-CARD] la tarjeta "${name}" navega a ${href}`, async ({ page }) => {
      const link = page
        .locator(`a[href="${href}"], a[href="https://practice.expandtesting.com${href}"]`)
        .filter({ hasText: /./ })
        .first();
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${href}/?$`));
    });
  }

  test('[HOME-04] "Test Cases" navega a /test-cases', async ({ page }) => {
    await page.getByRole('link', { name: 'Test Cases', exact: true }).first().click();
    await expect(page).toHaveURL(/\/test-cases/);
  });

  test('[HOME-05] "About" navega a /about', async ({ page }) => {
    await page.getByRole('link', { name: 'About', exact: true }).first().click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('[HOME-06] "API Testing" abre la documentación Swagger', async ({ page }) => {
    await page.getByRole('link', { name: 'API Testing', exact: true }).first().click();
    await expect(page).toHaveURL(/api-docs/);
  });

  test('[HOME-07] el logo regresa al home desde otra página', async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('link', { name: /SUT Practice/i }).first().click();
    await expect(page).toHaveURL(/practice\.expandtesting\.com\/?$/);
  });

  test('[HOME-08] el pie de página muestra el copyright de Expand Testing', async ({ page }) => {
    await expect(page.getByText(/Copyright/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Expand Testing' }).first()).toBeVisible();
  });
});
