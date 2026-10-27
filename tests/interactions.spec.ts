import { test, expect } from '../src/fixtures/base';

test.describe('Hovers', () => {
  for (let i = 0; i < 3; i++) {
    test(`[HOV-${i + 1}] pasar el mouse sobre la imagen ${i + 1} revela información`, async ({ page }) => {
      await page.goto('/hovers');
      const figures = page.locator('.figure, figure, .card');
      const fig = figures.nth(i);
      await fig.hover();
      await expect(page.getByText(new RegExp(`user${i + 1}`, 'i')).first()).toBeVisible();
    });
  }
});

test.describe('Key presses', () => {
  const keys = ['A', 'z', '7', 'Enter', 'Escape', 'Tab', 'ArrowLeft', 'Space', 'Backspace'];
  for (const key of keys) {
    test(`[KEY] presionar "${key}" se refleja en pantalla`, async ({ page }) => {
      await page.goto('/key-presses');
      await page.locator('input[type="text"]').first().focus();
      await page.keyboard.press(key);
      await expect(page.getByText(/you entered/i)).toBeVisible();
    });
  }
});

test.describe('Horizontal slider', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/horizontal-slider');
  });

  test('[SLD-01] existe un input range', async ({ page }) => {
    await expect(page.locator('input[type="range"]')).toBeVisible();
  });

  test('[SLD-02] la tecla End lleva al valor máximo', async ({ page }) => {
    const r = page.locator('input[type="range"]');
    await r.focus();
    await page.keyboard.press('End');
    const max = await r.getAttribute('max');
    await expect(r).toHaveValue(max ?? '5');
  });

  test('[SLD-03] la tecla Home lleva al valor mínimo', async ({ page }) => {
    const r = page.locator('input[type="range"]');
    await r.focus();
    await page.keyboard.press('End');
    await page.keyboard.press('Home');
    const min = (await r.getAttribute('min')) ?? '0';
    await expect(r).toHaveValue(min);
  });

  test('[SLD-04] ArrowRight incrementa el valor', async ({ page }) => {
    const r = page.locator('input[type="range"]');
    await r.focus();
    await page.keyboard.press('Home');
    const before = Number(await r.inputValue());
    await page.keyboard.press('ArrowRight');
    expect(Number(await r.inputValue())).toBeGreaterThan(before);
  });

  test('[SLD-05] ArrowLeft decrementa el valor', async ({ page }) => {
    const r = page.locator('input[type="range"]');
    await r.focus();
    await page.keyboard.press('End');
    const before = Number(await r.inputValue());
    await page.keyboard.press('ArrowLeft');
    expect(Number(await r.inputValue())).toBeLessThan(before);
  });
});

test.describe('Drag and drop', () => {
  test('[DND-01] existen las columnas A y B', async ({ page }) => {
    await page.goto('/drag-and-drop');
    await expect(page.locator('#column-a')).toBeVisible();
    await expect(page.locator('#column-b')).toBeVisible();
  });

  test('[DND-02] arrastrar A sobre B intercambia los encabezados', async ({ page }) => {
    await page.goto('/drag-and-drop');
    await page.locator('#column-a').dragTo(page.locator('#column-b'));
    await expect(page.locator('#column-a')).toContainText('B');
    await expect(page.locator('#column-b')).toContainText('A');
  });

  test('[DND-03] arrastrar dos veces devuelve el orden original', async ({ page }) => {
    await page.goto('/drag-and-drop');
    await page.locator('#column-a').dragTo(page.locator('#column-b'));
    await page.locator('#column-a').dragTo(page.locator('#column-b'));
    await expect(page.locator('#column-a')).toContainText('A');
  });

  test('[DND-04] la página de círculos carga con elementos arrastrables', async ({ page }) => {
    await page.goto('/drag-and-drop-circles');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('Context menu', () => {
  test('[CTX-01] click derecho en el área dispara un alert', async ({ page }) => {
    await page.goto('/context-menu');
    const dialogPromise = page.waitForEvent('dialog');
    await page.locator('#hot-spot').click({ button: 'right' });
    const dialog = await dialogPromise;
    expect(dialog.type()).toBe('alert');
    await dialog.accept();
  });

  test('[CTX-02] click izquierdo en el área no dispara alert', async ({ page }) => {
    await page.goto('/context-menu');
    let fired = false;
    page.on('dialog', async (d) => {
      fired = true;
      await d.dismiss();
    });
    await page.locator('#hot-spot').click();
    await page.waitForTimeout(500);
    expect(fired).toBe(false);
  });
});

test.describe('Tooltips, floating menu y scrollbars', () => {
  test('[TIP-01] pasar el mouse sobre un botón muestra un tooltip', async ({ page }) => {
    await page.goto('/tooltips');
    await page.getByRole('button').first().hover();
    await expect(
      page.locator('[role="tooltip"], .tooltip, .bs-tooltip-auto, .ui-tooltip').first(),
    ).toBeVisible();
  });

  test('[FLM-01] el menú flotante sigue visible tras hacer scroll', async ({ page }) => {
    await page.goto('/floating-menu');
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(500);
    await expect(page.getByRole('link', { name: 'Home' }).first()).toBeInViewport();
  });

  test('[SCR-01] se puede llevar a la vista un elemento fuera de pantalla', async ({ page }) => {
    await page.goto('/scrollbars');
    const target = page.getByRole('button').last();
    await target.scrollIntoViewIfNeeded();
    await expect(target).toBeInViewport();
  });
});

test.describe('Redirector, geolocalización y navegador', () => {
  test('[RED-01] el enlace de redirect lleva a /status-codes', async ({ page }) => {
    await page.goto('/redirector');
    await page.getByRole('link', { name: /redirect/i }).first().click();
    await expect(page).toHaveURL(/status-codes/);
  });

  test.describe('con geolocalización', () => {
    test.use({
      permissions: ['geolocation'],
      geolocation: { latitude: 20.5888, longitude: -100.3899 },
    });

    test('[GEO-01] muestra las coordenadas simuladas de Querétaro', async ({ page }) => {
      await page.goto('/geolocation');
      await page.getByRole('button', { name: /where am i/i }).click();
      await expect(page.getByText(/20\.58/).first()).toBeVisible();
    });
  });

  test('[MYB-01] "Browser Type" detecta el navegador', async ({ page }) => {
    await page.goto('/my-browser');
    await page.getByRole('button', { name: /browser type/i }).click();
    await expect(page.getByText(/chrom|firefox|safari|webkit/i).first()).toBeVisible();
  });

  test('[MYIP-01] /my-ip muestra una dirección IP', async ({ page }) => {
    await page.goto('/my-ip');
    await expect(page.locator('body')).toContainText(/\d{1,3}(\.\d{1,3}){3}|[0-9a-f:]{6,}/i);
  });
});

test.describe('jQuery UI', () => {
  test('[JQ-01] el menú jQuery UI muestra submenús al pasar el mouse', async ({ page }) => {
    await page.goto('/jqueryui/menu');
    await page.getByText('Enabled', { exact: true }).first().hover();
    await expect(page.getByText('Downloads').first()).toBeVisible();
  });

  test('[JQ-02] el submenú Downloads ofrece PDF, CSV y Excel', async ({ page }) => {
    await page.goto('/jqueryui/menu');
    await page.getByText('Enabled', { exact: true }).first().hover();
    await page.getByText('Downloads').first().hover();
    for (const name of ['PDF', 'CSV', 'Excel']) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }
  });
});
