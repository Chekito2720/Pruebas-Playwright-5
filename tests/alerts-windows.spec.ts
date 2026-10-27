import { test, expect } from '../src/fixtures/base';

test.describe('JavaScript dialogs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/js-dialogs');
  });

  test('[JSD-01] hay botones para alert, confirm y prompt', async ({ page }) => {
    await expect(page.getByRole('button', { name: /alert/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /confirm/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /prompt/i }).first()).toBeVisible();
  });

  test('[JSD-02] el alert es de tipo "alert" y se acepta', async ({ page }) => {
    const p = page.waitForEvent('dialog');
    await page.getByRole('button', { name: /alert/i }).first().click();
    const d = await p;
    expect(d.type()).toBe('alert');
    await d.accept();
  });

  test('[JSD-03] tras aceptar el alert aparece un resultado', async ({ page }) => {
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /alert/i }).first().click();
    await expect(page.getByText(/successfully|clicked/i).first()).toBeVisible();
  });

  test('[JSD-04] el confirm es de tipo "confirm"', async ({ page }) => {
    const p = page.waitForEvent('dialog');
    await page.getByRole('button', { name: /confirm/i }).first().click();
    const d = await p;
    expect(d.type()).toBe('confirm');
    await d.dismiss();
  });

  test('[JSD-05] aceptar el confirm muestra "Ok"', async ({ page }) => {
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /confirm/i }).first().click();
    await expect(page.getByText(/ok/i).first()).toBeVisible();
  });

  test('[JSD-06] cancelar el confirm muestra "Cancel"', async ({ page }) => {
    page.once('dialog', (d) => d.dismiss());
    await page.getByRole('button', { name: /confirm/i }).first().click();
    await expect(page.getByText(/cancel/i).first()).toBeVisible();
  });

  test('[JSD-07] el prompt es de tipo "prompt"', async ({ page }) => {
    const p = page.waitForEvent('dialog');
    await page.getByRole('button', { name: /prompt/i }).first().click();
    const d = await p;
    expect(d.type()).toBe('prompt');
    await d.dismiss();
  });

  test('[JSD-08] el texto escrito en el prompt se muestra en pantalla', async ({ page }) => {
    page.once('dialog', (d) => d.accept('Hola Playwright'));
    await page.getByRole('button', { name: /prompt/i }).first().click();
    await expect(page.getByText('Hola Playwright').first()).toBeVisible();
  });

  test('[JSD-09] cancelar el prompt no muestra texto ingresado', async ({ page }) => {
    page.once('dialog', (d) => d.dismiss());
    await page.getByRole('button', { name: /prompt/i }).first().click();
    await expect(page.getByText('Hola Playwright')).toHaveCount(0);
  });

  test('[JSD-10] los diálogos tienen un mensaje no vacío', async ({ page }) => {
    const p = page.waitForEvent('dialog');
    await page.getByRole('button', { name: /alert/i }).first().click();
    const d = await p;
    expect(d.message().length).toBeGreaterThan(0);
    await d.accept();
  });
});

test.describe('Ventanas e iframes', () => {
  test('[WIN-01] "Click Here" abre una nueva ventana', async ({ page, context }) => {
    await page.goto('/windows');
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: /click here/i }).click(),
    ]);
    await popup.waitForLoadState();
    expect(popup.url()).toContain('/windows/');
  });

  test('[WIN-02] la nueva ventana tiene contenido', async ({ page, context }) => {
    await page.goto('/windows');
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: /click here/i }).click(),
    ]);
    await popup.waitForLoadState();
    await expect(popup.locator('body')).not.toBeEmpty();
  });

  test('[WIN-03] la ventana original sigue abierta tras abrir otra', async ({ page, context }) => {
    await page.goto('/windows');
    await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: /click here/i }).click(),
    ]);
    expect(context.pages().length).toBe(2);
    await expect(page).toHaveURL(/\/windows/);
  });

  test('[IFR-01] la página contiene al menos un iframe', async ({ page }) => {
    await page.goto('/iframe');
    expect(await page.locator('iframe').count()).toBeGreaterThanOrEqual(1);
  });

  test('[IFR-02] el iframe tiene un documento accesible', async ({ page }) => {
    await page.goto('/iframe');
    const frame = page.frameLocator('iframe').first();
    await expect(frame.locator('body')).toBeAttached();
  });
});

test.describe('Modales y avisos', () => {
  test('[ENT-01] el anuncio de entrada aparece al cargar', async ({ page }) => {
    await page.goto('/entry-ad');
    await expect(page.locator('.modal.show, [role="dialog"]').first()).toBeVisible({ timeout: 15_000 });
  });

  test('[ENT-02] el anuncio se puede cerrar', async ({ page }) => {
    await page.goto('/entry-ad');
    const modal = page.locator('.modal.show, [role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 15_000 });
    await modal.getByRole('button', { name: /close/i }).first().click();
    await expect(modal).toBeHidden();
  });

  test('[ENT-03] una vez cerrado, no reaparece al recargar', async ({ page }) => {
    await page.goto('/entry-ad');
    const modal = page.locator('.modal.show, [role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 15_000 });
    await modal.getByRole('button', { name: /close/i }).first().click();
    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page.locator('.modal.show')).toHaveCount(0);
  });

  test('[CKE-01] aparece el aviso de cookies', async ({ page }) => {
    await page.goto('/cookie-alert');
    await expect(page.getByRole('button', { name: /accept|agree|ok|got it/i }).first()).toBeVisible();
  });

  test('[CKE-02] aceptar el aviso de cookies lo oculta', async ({ page }) => {
    await page.goto('/cookie-alert');
    const btn = page.getByRole('button', { name: /accept|agree|ok|got it/i }).first();
    await btn.click();
    await expect(btn).toBeHidden();
  });
});

test.describe('Errores, consola, imágenes y cabeceras', () => {
  test('[JSE-01] /javascript-error produce un error de JavaScript', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/javascript-error');
    await expect.poll(() => errors.length).toBeGreaterThan(0);
  });

  test('[JSE-02] una página normal NO produce errores de JavaScript', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/about');
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });

  test('[CON-LOG-01] /console-logs emite mensajes de consola', async ({ page }) => {
    const msgs: string[] = [];
    page.on('console', (m) => msgs.push(m.type()));
    await page.goto('/console-logs');
    await page.waitForTimeout(1000);
    expect(msgs.length).toBeGreaterThan(0);
  });

  test('[BRK-01] /broken-images contiene imágenes rotas', async ({ page }) => {
    await page.goto('/broken-images');
    await page.waitForLoadState('networkidle');
    const broken = await page.evaluate(
      () => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
    );
    expect(broken).toBeGreaterThanOrEqual(1);
  });

  test('[HDR-01] /http-headers lista el header User-Agent', async ({ page }) => {
    await page.goto('/http-headers');
    await expect(page.getByText(/user-agent/i).first()).toBeVisible();
  });

  test('[SHD-01] el Shadow DOM contiene contenido visible', async ({ page }) => {
    await page.goto('/shadowdom');
    await expect(page.locator('h1').first()).toBeVisible();
    const hasShadow = await page.evaluate(() =>
      [...document.querySelectorAll('*')].some((el) => el.shadowRoot),
    );
    expect(hasShadow).toBe(true);
  });
});

test.describe('Autenticación HTTP', () => {
  test('[BAS-01] Basic Auth sin credenciales devuelve 401', async ({ request }) => {
    const res = await request.get('/basic-auth');
    expect(res.status()).toBe(401);
  });

  test('[BAS-02] Digest Auth sin credenciales devuelve 401', async ({ request }) => {
    const res = await request.get('/digest-auth');
    expect(res.status()).toBe(401);
  });

  test.describe('con credenciales admin/admin', () => {
    test.use({ httpCredentials: { username: 'admin', password: 'admin' } });

    test('[BAS-03] Basic Auth con credenciales correctas permite el acceso', async ({ page }) => {
      const res = await page.goto('/basic-auth');
      expect(res?.status()).toBe(200);
    });
  });

  test.describe('con credenciales incorrectas', () => {
    test.use({ httpCredentials: { username: 'admin', password: 'incorrecta' } });

    test('[BAS-04] Basic Auth con credenciales incorrectas es rechazado', async ({ page }) => {
      const res = await page.goto('/basic-auth');
      expect(res?.status()).toBe(401);
    });
  });
});
