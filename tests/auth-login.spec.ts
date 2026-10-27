import { test, expect } from '../src/fixtures/base';
import { LoginPage } from '../src/pages/LoginPage';

const USER = 'practice';
const PASS = 'SuperSecretPassword!';

test.describe('Login', () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto();
  });

  test('[LOGIN-01] muestra los campos y el botón Login', async () => {
    await expect(login.username).toBeVisible();
    await expect(login.password).toBeVisible();
    await expect(login.submit).toBeVisible();
  });

  test('[LOGIN-02] muestra las credenciales de práctica en pantalla', async ({ page }) => {
    await expect(page.getByText(USER, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(PASS, { exact: true }).first()).toBeVisible();
  });

  test('[LOGIN-03] el campo password oculta los caracteres', async () => {
    await expect(login.password).toHaveAttribute('type', 'password');
  });

  test('[LOGIN-04] los campos inician vacíos', async () => {
    await expect(login.username).toHaveValue('');
    await expect(login.password).toHaveValue('');
  });

  test('[LOGIN-05] login exitoso redirige a /secure', async ({ page }) => {
    await login.login(USER, PASS);
    await expect(page).toHaveURL(/\/secure/);
    await expect(page.getByText('You logged into a secure area!')).toBeVisible();
  });

  test('[LOGIN-06] en /secure aparece el botón Logout', async ({ page }) => {
    await login.login(USER, PASS);
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('[LOGIN-07] logout regresa a /login con mensaje', async ({ page }) => {
    await login.login(USER, PASS);
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(login.flash).toContainText(/logged out/i);
  });

  test('[LOGIN-08] la sesión persiste al recargar /secure', async ({ page }) => {
    await login.login(USER, PASS);
    await page.reload();
    await expect(page).toHaveURL(/\/secure/);
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('[LOGIN-09] /secure sin sesión redirige a /login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/secure');
    await expect(page).toHaveURL(/\/login/);
  });

  test('[LOGIN-10] se puede enviar el formulario con la tecla Enter', async ({ page }) => {
    await login.username.fill(USER);
    await login.password.fill(PASS);
    await login.password.press('Enter');
    await expect(page).toHaveURL(/\/secure/);
  });

  test('[LOGIN-11] usuario inválido muestra error y permanece en /login', async ({ page }) => {
    await login.login('wrongUser', PASS);
    await expect(login.flash).toContainText(/invalid.*username|username.*invalid/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test('[LOGIN-12] password inválido muestra error y permanece en /login', async ({ page }) => {
    await login.login(USER, 'WrongPassword');
    await expect(login.flash).toContainText(/invalid.*password|password.*invalid/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test('[LOGIN-13] campos vacíos no permiten iniciar sesión', async ({ page }) => {
    await login.submit.click();
    await expect(page).not.toHaveURL(/\/secure/);
  });

  test('[LOGIN-14] solo usuario sin password no inicia sesión', async ({ page }) => {
    await login.login(USER, '');
    await expect(page).not.toHaveURL(/\/secure/);
  });

  test('[LOGIN-15] solo password sin usuario no inicia sesión', async ({ page }) => {
    await login.login('', PASS);
    await expect(page).not.toHaveURL(/\/secure/);
  });

  test('[LOGIN-16] el usuario distingue mayúsculas/minúsculas', async ({ page }) => {
    await login.login('PRACTICE', PASS);
    await expect(page).not.toHaveURL(/\/secure/);
  });

  test('[LOGIN-17] el password distingue mayúsculas/minúsculas', async ({ page }) => {
    await login.login(USER, PASS.toUpperCase());
    await expect(page).not.toHaveURL(/\/secure/);
  });

  test('[LOGIN-18] espacios alrededor del usuario no inician sesión', async ({ page }) => {
    await login.login(`  ${USER}  `, PASS);
    await expect(page).not.toHaveURL(/\/secure/);
  });

  test('[LOGIN-19] el enlace "here" lleva a /register', async ({ page }) => {
    await page.getByRole('link', { name: 'here', exact: true }).first().click();
    await expect(page).toHaveURL(/\/register/);
  });

  const hostile = [
    ["' OR '1'='1", 'SQL injection clásica'],
    ["admin'--", 'SQL injection con comentario'],
    ['<script>alert(1)</script>', 'XSS básico'],
    ['"><img src=x onerror=alert(1)>', 'XSS con atributo'],
    ['../../etc/passwd', 'path traversal'],
    ['a'.repeat(300), 'cadena muy larga (300 caracteres)'],
    ['👾🔥', 'emojis'],
    ['${7*7}', 'template injection'],
  ];
  for (const [value, label] of hostile) {
    test(`[LOGIN-SEC] entrada hostil como usuario (${label}) no inicia sesión`, async ({ page }) => {
      let dialogSeen = false;
      page.on('dialog', async (d) => {
        dialogSeen = true;
        await d.dismiss();
      });
      await login.login(value, PASS);
      await expect(page).not.toHaveURL(/\/secure/);
      expect(dialogSeen, 'no debe ejecutarse JavaScript inyectado').toBe(false);
    });
  }
});
