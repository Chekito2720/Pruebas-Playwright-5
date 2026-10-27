import { test, expect } from '../src/fixtures/base';
import { RegisterPage } from '../src/pages/RegisterPage';
import { LoginPage } from '../src/pages/LoginPage';
import { uniqueUsername, VALID_PASSWORD } from '../src/utils/random';

test.describe('Register', () => {
  let reg: RegisterPage;

  test.beforeEach(async ({ page }) => {
    reg = new RegisterPage(page);
    await reg.goto();
  });

  test('[REG-01] muestra username, password, confirm password y botón Register', async () => {
    await expect(reg.username).toBeVisible();
    await expect(reg.password).toBeVisible();
    await expect(reg.confirm).toBeVisible();
    await expect(reg.submit).toBeVisible();
  });

  test('[REG-02] los campos de password están enmascarados', async () => {
    await expect(reg.password).toHaveAttribute('type', 'password');
    await expect(reg.confirm).toHaveAttribute('type', 'password');
  });

  test('[REG-03] registro exitoso redirige a /login con mensaje', async ({ page }) => {
    await reg.register(uniqueUsername(), VALID_PASSWORD);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('#flash')).toContainText(/successfully registered/i);
  });

  test('[REG-04] el usuario recién registrado puede iniciar sesión', async ({ page }) => {
    const user = uniqueUsername();
    await reg.register(user, VALID_PASSWORD);
    await expect(page).toHaveURL(/\/login/);
    const login = new LoginPage(page);
    await login.login(user, VALID_PASSWORD);
    await expect(page).toHaveURL(/\/secure/);
  });

  test('[REG-05] no permite registrar un usuario duplicado', async ({ page }) => {
    const user = uniqueUsername();
    await reg.register(user, VALID_PASSWORD);
    await expect(page).toHaveURL(/\/login/);
    await reg.goto();
    await reg.register(user, VALID_PASSWORD);
    await expect(page.locator('#flash')).toContainText(/already|exists|taken/i);
    await expect(page).toHaveURL(/\/register/);
  });

  test('[REG-06] passwords distintos muestran error', async ({ page }) => {
    await reg.register(uniqueUsername(), VALID_PASSWORD, 'OtraClave!999');
    await expect(page.locator('#flash')).toContainText(/match|same|coincid/i);
    await expect(page).toHaveURL(/\/register/);
  });

  test('[REG-07] formulario vacío no registra', async ({ page }) => {
    await reg.submit.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('[REG-08] sin username no registra', async ({ page }) => {
    await reg.register('', VALID_PASSWORD);
    await expect(page).toHaveURL(/\/register/);
  });

  test('[REG-09] sin password no registra', async ({ page }) => {
    await reg.register(uniqueUsername(), '', '');
    await expect(page).toHaveURL(/\/register/);
  });

  test('[REG-10] sin confirmación de password no registra', async ({ page }) => {
    await reg.register(uniqueUsername(), VALID_PASSWORD, '');
    await expect(page).toHaveURL(/\/register/);
  });

  const invalidUsers: Array<[string, string]> = [
    ['ab', 'demasiado corto (2 caracteres)'],
    ['usuario con espacios', 'contiene espacios'],
    ['user@name!', 'caracteres especiales'],
    ['<script>alert(1)</script>', 'XSS'],
    ['x'.repeat(100), 'demasiado largo (100 caracteres)'],
  ];
  for (const [value, label] of invalidUsers) {
    test(`[REG-USER] username inválido (${label}) no se registra`, async ({ page }) => {
      await reg.register(value, VALID_PASSWORD);
      await expect(page).toHaveURL(/\/register/);
    });
  }

  test('[REG-11] password demasiado corto no se registra', async ({ page }) => {
    await reg.register(uniqueUsername(), 'ab', 'ab');
    await expect(page).toHaveURL(/\/register/);
  });

  test('[REG-12] el XSS en username no ejecuta JavaScript', async ({ page }) => {
    let dialogSeen = false;
    page.on('dialog', async (d) => {
      dialogSeen = true;
      await d.dismiss();
    });
    await reg.register('<img src=x onerror=alert(1)>', VALID_PASSWORD);
    expect(dialogSeen).toBe(false);
  });
});
