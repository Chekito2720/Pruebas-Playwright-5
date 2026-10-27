import { test, expect } from '../src/fixtures/base';

test.describe('BMI Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bmi');
  });

  const age = (p: import('@playwright/test').Page) => p.locator('#age, input[name="age"]').first();
  const height = (p: import('@playwright/test').Page) => p.locator('#height, input[name="height"]').first();
  const weight = (p: import('@playwright/test').Page) => p.locator('#weight, input[name="weight"]').first();

  test('[BMI-01] muestra los campos edad, estatura y peso', async ({ page }) => {
    await expect(age(page)).toBeVisible();
    await expect(height(page)).toBeVisible();
    await expect(weight(page)).toBeVisible();
  });

  test('[BMI-02] existen los botones Calculate y Clear', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Calculate' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
  });

  test('[BMI-03] se puede elegir género Female y Male', async ({ page }) => {
    const radios = page.locator('input[type="radio"]');
    expect(await radios.count()).toBeGreaterThanOrEqual(2);
    await radios.nth(1).check();
    await expect(radios.nth(1)).toBeChecked();
    await radios.nth(0).check();
    await expect(radios.nth(0)).toBeChecked();
  });

  // BMI = peso / (estatura en metros)^2  → con 170 cm
  const cases: Array<[number, string]> = [
    [50, '17.3'],
    [70, '24.2'],
    [85, '29.4'],
    [100, '34.6'],
  ];
  for (const [kg, bmi] of cases) {
    test(`[BMI-CALC] 30 años, 170 cm, ${kg} kg → IMC ${bmi}`, async ({ page }) => {
      await age(page).fill('30');
      await height(page).fill('170');
      await weight(page).fill(String(kg));
      await page.getByRole('button', { name: 'Calculate' }).click();
      await expect(page.getByText(bmi, { exact: false }).first()).toBeVisible();
    });
  }

  test('[BMI-04] "Clear" limpia los campos', async ({ page }) => {
    await age(page).fill('30');
    await height(page).fill('170');
    await weight(page).fill('70');
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(age(page)).toHaveValue('');
    await expect(height(page)).toHaveValue('');
    await expect(weight(page)).toHaveValue('');
  });

  test('[BMI-05] calcular sin datos no genera resultado numérico', async ({ page }) => {
    await page.getByRole('button', { name: 'Calculate' }).click();
    await expect(page.getByText(/\b\d{2}\.\d\b/)).toHaveCount(0);
  });

  for (const badAge of ['1', '121', '-5']) {
    test(`[BMI-AGE] edad fuera de rango (${badAge}) no calcula IMC`, async ({ page }) => {
      await age(page).fill(badAge);
      await height(page).fill('170');
      await weight(page).fill('70');
      await page.getByRole('button', { name: 'Calculate' }).click();
      await expect(page.getByText('24.2')).toHaveCount(0);
    });
  }
});

test.describe('Secure Password Checker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/secure-password-checker');
  });

  test('[PWD-01] existe un campo de contraseña', async ({ page }) => {
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('[PWD-02] el campo acepta una contraseña', async ({ page }) => {
    const input = page.locator('input').first();
    await input.fill('abc123');
    await expect(input).toHaveValue('abc123');
  });

  test('[PWD-03] la evaluación cambia entre una clave débil y una fuerte', async ({ page }) => {
    const input = page.locator('input').first();
    await input.fill('abc');
    await input.press('Tab');
    const weak = await page.locator('body').innerText();
    await input.fill('Str0ng!Passw0rd#2026-xyz');
    await input.press('Tab');
    const strong = await page.locator('body').innerText();
    expect(strong).not.toEqual(weak);
  });
});

test.describe('Otras apps', () => {
  test('[APP-01] Calorie Tracker muestra su interfaz', async ({ page }) => {
    await page.goto('/tracalorie');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('[APP-02] Color Wheel carga y muestra contenido', async ({ page }) => {
    await page.goto('/color-wheel');
    await expect(page.locator('h1, h2, canvas').first()).toBeVisible();
  });

  test('[APP-03] Web Parking carga con contenido', async ({ page }) => {
    await page.goto('/webpark');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('[APP-04] Notes App (React) muestra opción de login', async ({ page }) => {
    await page.goto('/notes/app');
    await expect(page.getByRole('link', { name: /login/i }).first()).toBeVisible();
  });

  test('[APP-05] Notes App permite ir a la pantalla de login', async ({ page }) => {
    await page.goto('/notes/app');
    await page.getByRole('link', { name: /login/i }).first().click();
    await expect(page).toHaveURL(/login/);
  });

  test('[APP-06] Notes App permite ir a la pantalla de registro', async ({ page }) => {
    await page.goto('/notes/app');
    await page.getByRole('link', { name: /create an account|register|sign up/i }).first().click();
    await expect(page).toHaveURL(/register/);
  });
});
