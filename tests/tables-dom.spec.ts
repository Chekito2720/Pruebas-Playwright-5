import { test, expect } from '../src/fixtures/base';

async function columnTexts(table: import('@playwright/test').Locator, col: number) {
  const cells = table.locator(`tbody tr td:nth-child(${col})`);
  return (await cells.allInnerTexts()).map((t) => t.trim().toLowerCase());
}

const isAsc = (a: string[]) => a.every((v, i) => i === 0 || a[i - 1].localeCompare(v) <= 0);
const isDesc = (a: string[]) => a.every((v, i) => i === 0 || a[i - 1].localeCompare(v) >= 0);

test.describe('Sortable tables', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tables');
  });

  test('[TBL-01] hay al menos una tabla', async ({ page }) => {
    expect(await page.locator('table').count()).toBeGreaterThanOrEqual(1);
  });

  test('[TBL-02] la tabla tiene encabezados', async ({ page }) => {
    expect(await page.locator('table').first().locator('thead th').count()).toBeGreaterThanOrEqual(4);
  });

  test('[TBL-03] los encabezados incluyen Last Name, First Name y Email', async ({ page }) => {
    const head = (await page.locator('table').first().locator('thead').innerText()).toLowerCase();
    for (const h of ['last name', 'first name', 'email']) expect(head).toContain(h);
  });

  test('[TBL-04] la tabla tiene al menos 3 filas de datos', async ({ page }) => {
    expect(await page.locator('table').first().locator('tbody tr').count()).toBeGreaterThanOrEqual(3);
  });

  test('[TBL-05] las celdas de Email contienen "@"', async ({ page }) => {
    const emails = await columnTexts(page.locator('table').first(), 3);
    expect(emails.some((e) => e.includes('@'))).toBe(true);
  });

  test('[TBL-06] click en "Last Name" ordena la columna', async ({ page }) => {
    const table = page.locator('table').first();
    await table.locator('thead th', { hasText: /last name/i }).first().click();
    const col = await columnTexts(table, 1);
    expect(isAsc(col) || isDesc(col)).toBe(true);
  });

  test('[TBL-07] segundo click en "Last Name" invierte el orden', async ({ page }) => {
    const table = page.locator('table').first();
    const th = table.locator('thead th', { hasText: /last name/i }).first();
    await th.click();
    const first = await columnTexts(table, 1);
    await th.click();
    const second = await columnTexts(table, 1);
    expect(second).not.toEqual(first);
  });

  test('[TBL-08] click en "Email" ordena la columna', async ({ page }) => {
    const table = page.locator('table').first();
    await table.locator('thead th', { hasText: /email/i }).first().click();
    const col = await columnTexts(table, 3);
    expect(isAsc(col) || isDesc(col)).toBe(true);
  });

  test('[TBL-09] ordenar no cambia la cantidad de filas', async ({ page }) => {
    const table = page.locator('table').first();
    const before = await table.locator('tbody tr').count();
    await table.locator('thead th').first().click();
    expect(await table.locator('tbody tr').count()).toBe(before);
  });
});

test.describe('Dynamic table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dynamic-table');
  });

  test('[DT-01] la tabla dinámica es visible', async ({ page }) => {
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('[DT-02] contiene la fila del navegador Chrome', async ({ page }) => {
    await expect(page.locator('table').first()).toContainText('Chrome');
  });

  test('[DT-03] contiene varias filas de procesos', async ({ page }) => {
    expect(await page.locator('table').first().locator('tbody tr').count()).toBeGreaterThanOrEqual(3);
  });

  test('[DT-04] los valores de CPU tienen formato porcentual', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/\d+(\.\d+)?\s?%/);
  });

  test('[DT-05] los valores cambian entre recargas', async ({ page }) => {
    const a = await page.locator('table').first().innerText();
    const values = new Set<string>([a]);
    for (let i = 0; i < 4; i++) {
      await page.reload();
      values.add(await page.locator('table').first().innerText());
    }
    expect(values.size).toBeGreaterThan(1);
  });
});

test.describe('Dynamic pagination table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dynamic-pagination-table');
  });

  test('[DPT-01] la tabla paginada es visible', async ({ page }) => {
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('[DPT-02] existe el selector de cantidad de filas', async ({ page }) => {
    await expect(page.locator('select[name$="_length"], .dt-length select').first()).toBeVisible();
  });

  test('[DPT-03] existe el cuadro de búsqueda', async ({ page }) => {
    await expect(page.locator('input[type="search"]').first()).toBeVisible();
  });

  test('[DPT-04] una búsqueda sin coincidencias muestra mensaje vacío', async ({ page }) => {
    await page.locator('input[type="search"]').first().fill('zzzzqqqq9999');
    await expect(page.getByText(/no matching records|no data/i).first()).toBeVisible();
  });

  test('[DPT-05] limpiar la búsqueda restaura las filas', async ({ page }) => {
    const search = page.locator('input[type="search"]').first();
    const rows = page.locator('table tbody tr');
    const initial = await rows.count();
    await search.fill('zzzzqqqq9999');
    await search.fill('');
    await expect(rows).toHaveCount(initial);
  });

  for (const size of ['10', '25', '50']) {
    test(`[DPT-LEN] mostrar ${size} filas por página`, async ({ page }) => {
      const select = page.locator('select[name$="_length"], .dt-length select').first();
      await select.selectOption(size);
      const rows = await page.locator('table tbody tr').count();
      expect(rows).toBeLessThanOrEqual(Number(size));
    });
  }

  test('[DPT-06] hay controles de paginación', async ({ page }) => {
    expect(
      await page.locator('.paginate_button, .dt-paging-button, .pagination a, .pagination button').count(),
    ).toBeGreaterThan(0);
  });
});

test.describe('Challenging DOM y Large DOM', () => {
  test('[CDM-01] hay tres botones de acción', async ({ page }) => {
    await page.goto('/challenging-dom');
    expect(await page.getByRole('link', { name: /^(foo|bar|baz|qux)/i }).count()
      + (await page.locator('a.button, button').count())).toBeGreaterThanOrEqual(3);
  });

  test('[CDM-02] la tabla tiene varias filas', async ({ page }) => {
    await page.goto('/challenging-dom');
    expect(await page.locator('table tbody tr').count()).toBeGreaterThanOrEqual(5);
  });

  test('[CDM-03] la tabla incluye acciones edit y delete', async ({ page }) => {
    await page.goto('/challenging-dom');
    await expect(page.getByText(/edit/i).first()).toBeVisible();
    await expect(page.getByText(/delete/i).first()).toBeVisible();
  });

  test('[CDM-04] hay un canvas', async ({ page }) => {
    await page.goto('/challenging-dom');
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('[LRG-01] el DOM grande tiene cientos de elementos', async ({ page }) => {
    await page.goto('/large');
    expect(await page.locator('div').count()).toBeGreaterThan(100);
  });

  test('[LRG-02] el DOM grande incluye una tabla', async ({ page }) => {
    await page.goto('/large');
    await expect(page.locator('table').first()).toBeAttached();
  });
});

test.describe('Locators y perfil de usuario', () => {
  test('[LOC-01] la página de locators tiene botones y enlaces', async ({ page }) => {
    await page.goto('/locators');
    expect(await page.getByRole('button').count()).toBeGreaterThan(0);
    expect(await page.getByRole('link').count()).toBeGreaterThan(5);
  });

  test('[USR-01] el perfil /users/1 carga con contenido', async ({ page }) => {
    await page.goto('/users/1');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
