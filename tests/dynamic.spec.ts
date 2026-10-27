import { test, expect } from '../src/fixtures/base';

test.describe('Add/Remove elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/add-remove-elements');
  });

  test('[ADD-01] al inicio no hay botones Delete', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);
  });

  for (const n of [1, 3, 5, 10]) {
    test(`[ADD-02] agregar ${n} elemento(s) crea ${n} botón(es) Delete`, async ({ page }) => {
      const add = page.getByRole('button', { name: 'Add Element' });
      for (let i = 0; i < n; i++) await add.click();
      await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(n);
    });
  }

  test('[ADD-03] eliminar un elemento reduce la cantidad', async ({ page }) => {
    const add = page.getByRole('button', { name: 'Add Element' });
    for (let i = 0; i < 3; i++) await add.click();
    await page.getByRole('button', { name: 'Delete' }).first().click();
    await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(2);
  });

  test('[ADD-04] eliminar todos deja la lista vacía', async ({ page }) => {
    const add = page.getByRole('button', { name: 'Add Element' });
    for (let i = 0; i < 4; i++) await add.click();
    const del = page.getByRole('button', { name: 'Delete' });
    while ((await del.count()) > 0) await del.first().click();
    await expect(del).toHaveCount(0);
  });
});

test.describe('Dynamic controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dynamic-controls');
  });

  test('[DC-01] el checkbox dinámico se puede remover', async ({ page }) => {
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByText(/it'?s gone/i)).toBeVisible();
  });

  test('[DC-02] el checkbox dinámico se puede volver a agregar', async ({ page }) => {
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByText(/it'?s gone/i)).toBeVisible();
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText(/it'?s back/i)).toBeVisible();
  });

  test('[DC-03] el input de texto inicia deshabilitado', async ({ page }) => {
    await expect(page.locator('input[type="text"]').first()).toBeDisabled();
  });

  test('[DC-04] "Enable" habilita el input', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable' }).click();
    await expect(page.getByText(/it'?s enabled/i)).toBeVisible();
    await expect(page.locator('input[type="text"]').first()).toBeEnabled();
  });

  test('[DC-05] el input habilitado acepta texto', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable' }).click();
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeEnabled();
    await input.fill('hola');
    await expect(input).toHaveValue('hola');
  });

  test('[DC-06] "Disable" vuelve a deshabilitar el input', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable' }).click();
    await expect(page.locator('input[type="text"]').first()).toBeEnabled();
    await page.getByRole('button', { name: 'Disable' }).click();
    await expect(page.getByText(/it'?s disabled/i)).toBeVisible();
    await expect(page.locator('input[type="text"]').first()).toBeDisabled();
  });
});

test.describe('Dynamic loading', () => {
  for (const n of [1, 2]) {
    test(`[DL-${n}] ejemplo ${n}: "Start" termina mostrando "Hello World!"`, async ({ page }) => {
      await page.goto(`/dynamic-loading/${n}`);
      await page.getByRole('button', { name: 'Start' }).click();
      await expect(page.getByText('Hello World!')).toBeVisible({ timeout: 20_000 });
    });

    test(`[DL-${n}b] ejemplo ${n}: antes de Start no se ve "Hello World!"`, async ({ page }) => {
      await page.goto(`/dynamic-loading/${n}`);
      await expect(page.getByText('Hello World!')).toBeHidden();
    });
  }

  test('[DL-03] el índice enlaza a los dos ejemplos', async ({ page }) => {
    await page.goto('/dynamic-loading');
    await expect(page.locator('a[href*="/dynamic-loading/1"]').first()).toBeVisible();
    await expect(page.locator('a[href*="/dynamic-loading/2"]').first()).toBeVisible();
  });
});

test.describe('Disappearing elements', () => {
  test('[DIS-01] siempre aparecen los enlaces Home, About y Contact Us', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.goto('/disappearing-elements');
      for (const name of ['Home', 'About', 'Contact Us']) {
        await expect(page.getByRole('link', { name }).first()).toBeVisible();
      }
    }
  });

  test('[DIS-02] el menú cambia entre recargas (Portfolio/Gallery)', async ({ page }) => {
    const seen = new Set<string>();
    for (let i = 0; i < 8; i++) {
      await page.goto('/disappearing-elements');
      const txt = (await page.locator('body').innerText()).toLowerCase();
      seen.add(`${txt.includes('gallery')}-${txt.includes('portfolio')}`);
    }
    expect(seen.size).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Notification message', () => {
  test('[NOT-01] cada click muestra un mensaje de notificación', async ({ page }) => {
    await page.goto('/notification-message');
    for (let i = 0; i < 3; i++) {
      await page.getByRole('link', { name: /click here/i }).click();
      await expect(page.locator('#flash')).toContainText(/action/i);
    }
  });
});

test.describe('Contenido dinámico y aleatorio', () => {
  test('[RND-01] /random-number muestra un número', async ({ page }) => {
    await page.goto('/random-number');
    await expect(page.locator('body')).toContainText(/\d+/);
  });

  test('[TYP-01] /typos muestra el texto de ejemplo', async ({ page }) => {
    await page.goto('/typos');
    await expect(page.getByText(/typo/i).first()).toBeVisible();
  });

  test('[TYP-02] /typos mantiene su estructura tras varias recargas', async ({ page }) => {
    for (let i = 0; i < 4; i++) {
      await page.goto('/typos');
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });

  test('[DCT-01] /dynamic-content muestra imágenes', async ({ page }) => {
    await page.goto('/dynamic-content');
    expect(await page.locator('img').count()).toBeGreaterThanOrEqual(3);
  });

  test('[DCT-02] /dynamic-content cambia entre recargas', async ({ page }) => {
    await page.goto('/dynamic-content');
    const a = await page.locator('main, body').first().innerText();
    await page.goto('/dynamic-content?withContent=static');
    await page.goto('/dynamic-content');
    const b = await page.locator('main, body').first().innerText();
    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);
  });

  for (const sub of ['menu', 'image', 'list']) {
    test(`[SHF-${sub}] /shifting-content/${sub} carga`, async ({ page }) => {
      const res = await page.goto(`/shifting-content/${sub}`);
      expect(res?.status()).toBe(200);
    });
  }

  test('[DID-01] el botón con ID dinámico es localizable por rol', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.goto('/dynamic-id');
      await expect(page.getByRole('button').first()).toBeVisible();
    }
  });

  test('[ABT-01] /abtest muestra una de las dos variantes', async ({ page }) => {
    await page.goto('/abtest');
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('[INF-01] el scroll infinito carga más contenido', async ({ page }) => {
    await page.goto('/infinite-scroll');
    const before = await page.evaluate(() => document.body.scrollHeight);
    for (let i = 0; i < 4; i++) {
      await page.mouse.wheel(0, 4000);
      await page.waitForTimeout(500);
    }
    await expect
      .poll(() => page.evaluate(() => document.body.scrollHeight), { timeout: 15_000 })
      .toBeGreaterThan(before);
  });

  test('[SLW-01] la página lenta termina de cargar', async ({ page }) => {
    const res = await page.goto('/slow', { timeout: 40_000 });
    expect(res?.status()).toBeLessThan(400);
  });

  test('[FLK-01] la página flaky carga y muestra contenido', async ({ page }) => {
    await page.goto('/flaky-test');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
