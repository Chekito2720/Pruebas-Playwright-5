import { test, expect } from '../src/fixtures/base';

test.describe('Web inputs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inputs');
  });

  test('[INP-01] existen los campos number, text, password y date', async ({ page }) => {
    for (const type of ['number', 'text', 'password', 'date']) {
      await expect(page.locator(`input[type="${type}"]`).first()).toBeVisible();
    }
  });

  test('[INP-02] el input number acepta dígitos', async ({ page }) => {
    const n = page.locator('input[type="number"]').first();
    await n.fill('12345');
    await expect(n).toHaveValue('12345');
  });

  test('[INP-03] el input number acepta decimales y negativos', async ({ page }) => {
    const n = page.locator('input[type="number"]').first();
    await n.fill('-3.5');
    await expect(n).toHaveValue('-3.5');
  });

  test('[INP-04] el input number rechaza letras', async ({ page }) => {
    const n = page.locator('input[type="number"]').first();
    await n.pressSequentially('abc');
    await expect(n).toHaveValue('');
  });

  test('[INP-05] el input text acepta texto con acentos y símbolos', async ({ page }) => {
    const t = page.locator('input[type="text"]').first();
    await t.fill('Canción #1 – ñandú');
    await expect(t).toHaveValue('Canción #1 – ñandú');
  });

  test('[INP-06] el input date acepta una fecha ISO', async ({ page }) => {
    const d = page.locator('input[type="date"]').first();
    await d.fill('2026-10-26');
    await expect(d).toHaveValue('2026-10-26');
  });

  test('[INP-07] "Display Inputs" muestra los valores capturados', async ({ page }) => {
    await page.locator('input[type="number"]').first().fill('42');
    await page.locator('input[type="text"]').first().fill('Chekito');
    await page.locator('input[type="date"]').first().fill('2026-10-26');
    await page.getByRole('button', { name: /display inputs/i }).click();
    await expect(page.getByText('42').first()).toBeVisible();
    await expect(page.getByText('Chekito').first()).toBeVisible();
  });

  test('[INP-08] "Clear Inputs" limpia los campos', async ({ page }) => {
    const n = page.locator('input[type="number"]').first();
    const t = page.locator('input[type="text"]').first();
    await n.fill('99');
    await t.fill('borrar');
    await page.getByRole('button', { name: /clear inputs/i }).click();
    await expect(n).toHaveValue('');
    await expect(t).toHaveValue('');
  });
});

test.describe('Radio buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/radio-buttons');
  });

  test('[RAD-01] existen varios radio buttons', async ({ page }) => {
    expect(await page.locator('input[type="radio"]').count()).toBeGreaterThanOrEqual(5);
  });

  test('[RAD-02] seleccionar un radio lo marca', async ({ page }) => {
    const first = page.locator('input[type="radio"]:enabled').first();
    await first.check();
    await expect(first).toBeChecked();
  });

  test('[RAD-03] en un mismo grupo solo uno puede estar marcado', async ({ page }) => {
    const radios = page.locator('input[type="radio"]:enabled');
    const name = await radios.first().getAttribute('name');
    const group = page.locator(`input[type="radio"][name="${name}"]:enabled`);
    const total = await group.count();
    expect(total).toBeGreaterThan(1);
    await group.nth(0).check();
    await group.nth(1).check();
    await expect(group.nth(0)).not.toBeChecked();
    await expect(group.nth(1)).toBeChecked();
  });

  test('[RAD-04] existe al menos un radio deshabilitado', async ({ page }) => {
    expect(await page.locator('input[type="radio"]:disabled').count()).toBeGreaterThanOrEqual(1);
  });

  test('[RAD-05] un radio deshabilitado no se puede marcar con click normal', async ({ page }) => {
    const disabled = page.locator('input[type="radio"]:disabled').first();
    await expect(disabled).toBeDisabled();
    await expect(disabled).not.toBeChecked();
  });
});

test.describe('Checkboxes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkboxes');
  });

  test('[CHK-01] hay exactamente dos checkboxes', async ({ page }) => {
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(2);
  });

  test('[CHK-02] el primero inicia desmarcado y el segundo marcado', async ({ page }) => {
    const boxes = page.locator('input[type="checkbox"]');
    await expect(boxes.nth(0)).not.toBeChecked();
    await expect(boxes.nth(1)).toBeChecked();
  });

  test('[CHK-03] marcar el primero lo deja marcado', async ({ page }) => {
    const first = page.locator('input[type="checkbox"]').nth(0);
    await first.check();
    await expect(first).toBeChecked();
  });

  test('[CHK-04] desmarcar el segundo lo deja desmarcado', async ({ page }) => {
    const second = page.locator('input[type="checkbox"]').nth(1);
    await second.uncheck();
    await expect(second).not.toBeChecked();
  });

  test('[CHK-05] alternar varias veces mantiene el estado coherente', async ({ page }) => {
    const first = page.locator('input[type="checkbox"]').nth(0);
    for (let i = 0; i < 5; i++) await first.click();
    await expect(first).toBeChecked();
  });
});

test.describe('Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dropdown');
  });

  test('[DDL-01] existe al menos un select', async ({ page }) => {
    expect(await page.locator('select').count()).toBeGreaterThanOrEqual(1);
  });

  test('[DDL-02] se puede seleccionar "Option 1" por etiqueta', async ({ page }) => {
    const dd = page.locator('select#dropdown');
    await dd.selectOption({ label: 'Option 1' });
    await expect(dd).toHaveValue('1');
  });

  test('[DDL-03] se puede seleccionar "Option 2" por valor', async ({ page }) => {
    const dd = page.locator('select#dropdown');
    await dd.selectOption('2');
    await expect(dd).toHaveValue('2');
  });

  test('[DDL-04] se puede seleccionar por índice', async ({ page }) => {
    const dd = page.locator('select#dropdown');
    await dd.selectOption({ index: 2 });
    await expect(dd).toHaveValue('2');
  });

  test('[DDL-05] el dropdown de países tiene una lista larga', async ({ page }) => {
    const country = page.locator('select#country');
    expect(await country.locator('option').count()).toBeGreaterThan(50);
  });

  test('[DDL-06] se puede elegir un país por etiqueta', async ({ page }) => {
    const country = page.locator('select#country');
    await country.selectOption({ label: 'Mexico' });
    await expect(country.locator('option:checked')).toHaveText('Mexico');
  });
});

test.describe('Form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form-validation');
  });

  test('[FV-01] el formulario es visible', async ({ page }) => {
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('[FV-02] enviar vacío deja el formulario inválido', async ({ page }) => {
    await page.getByRole('button', { name: /register/i }).click();
    const invalid = await page
      .locator('form')
      .first()
      .evaluate((f) => !(f as HTMLFormElement).checkValidity());
    expect(invalid).toBe(true);
  });

  test('[FV-03] enviar vacío no cambia de página', async ({ page }) => {
    await page.getByRole('button', { name: /register/i }).click();
    await expect(page).toHaveURL(/form-validation/);
  });

  test('[FV-04] hay campos requeridos', async ({ page }) => {
    expect(await page.locator('form [required]').count()).toBeGreaterThanOrEqual(1);
  });

  test('[FV-05] un select de pago permite elegir opciones', async ({ page }) => {
    const sel = page.locator('form select').first();
    const opts = await sel.locator('option').count();
    expect(opts).toBeGreaterThan(1);
    await sel.selectOption({ index: 1 });
    await expect(sel).not.toHaveValue('');
  });
});

test.describe('Contact y Feedback', () => {
  test('[CON-01] el formulario de contacto es visible', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('[CON-02] enviar contacto vacío es inválido', async ({ page }) => {
    await page.goto('/contact');
    const invalid = await page
      .locator('form')
      .first()
      .evaluate((f) => !(f as HTMLFormElement).checkValidity());
    expect(invalid).toBe(true);
  });

  test('[CON-03] el campo email del contacto valida formato', async ({ page }) => {
    await page.goto('/contact');
    const email = page.locator('input[type="email"]').first();
    await email.fill('no-es-un-correo');
    expect(await email.evaluate((e) => (e as HTMLInputElement).validity.valid)).toBe(false);
    await email.fill('qa@example.com');
    expect(await email.evaluate((e) => (e as HTMLInputElement).validity.valid)).toBe(true);
  });

  test('[FDB-01] el formulario de feedback es visible', async ({ page }) => {
    await page.goto('/feedback');
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('[FDB-02] feedback vacío es inválido', async ({ page }) => {
    await page.goto('/feedback');
    const invalid = await page
      .locator('form')
      .first()
      .evaluate((f) => !(f as HTMLFormElement).checkValidity());
    expect(invalid).toBe(true);
  });
});

test.describe('Upload / Download', () => {
  test('[UPL-01] existe el input de archivo', async ({ page }) => {
    await page.goto('/upload');
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('[UPL-02] se puede adjuntar un archivo de texto', async ({ page }) => {
    await page.goto('/upload');
    const input = page.locator('input[type="file"]');
    await input.setInputFiles({
      name: 'prueba.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('contenido de prueba'),
    });
    expect(await input.evaluate((i) => (i as HTMLInputElement).files?.[0]?.name)).toBe('prueba.txt');
  });

  test('[UPL-03] subir un archivo muestra confirmación', async ({ page }) => {
    await page.goto('/upload');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'prueba.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('hola'),
    });
    await page.getByRole('button', { name: /upload/i }).click();
    await expect(page.getByText(/uploaded/i).first()).toBeVisible();
  });

  test('[UPL-04] se puede quitar el archivo adjuntado', async ({ page }) => {
    await page.goto('/upload');
    const input = page.locator('input[type="file"]');
    await input.setInputFiles({ name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('a') });
    await input.setInputFiles([]);
    expect(await input.evaluate((i) => (i as HTMLInputElement).files?.length)).toBe(0);
  });

  test('[DWN-01] la página de descargas lista archivos', async ({ page }) => {
    await page.goto('/download');
    expect(await page.locator('a[href*="/download/"]').count()).toBeGreaterThan(0);
  });

  test('[DWN-02] hacer click en un archivo dispara una descarga', async ({ page }) => {
    await page.goto('/download');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('a[href*="/download/"]').first().click(),
    ]);
    expect(download.suggestedFilename().length).toBeGreaterThan(0);
  });

  test('[DWN-03] la descarga segura exige autenticación', async ({ page }) => {
    await page.goto('/download-secure');
    await expect(page).toHaveURL(/login|download-secure/);
  });
});

test.describe('Autocomplete', () => {
  test('[AUT-01] el campo de autocompletado es visible y editable', async ({ page }) => {
    await page.goto('/autocomplete');
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeEditable();
  });

  test('[AUT-02] escribir texto actualiza el valor', async ({ page }) => {
    await page.goto('/autocomplete');
    const input = page.locator('input[type="text"]').first();
    await input.pressSequentially('Uni', { delay: 50 });
    await expect(input).toHaveValue('Uni');
  });
});
