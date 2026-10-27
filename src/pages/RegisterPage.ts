import { Page, Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly confirm: Locator;
  readonly submit: Locator;
  readonly flash: Locator;

  constructor(private readonly page: Page) {
    this.username = page.locator('#username');
    this.password = page.locator('#password');
    this.confirm = page.locator('#confirmPassword');
    this.submit = page.getByRole('button', { name: 'Register' });
    this.flash = page.locator('#flash');
  }

  async goto() {
    await this.page.goto('/register');
    await expect(this.username).toBeVisible();
  }

  async register(user: string, pass: string, confirm = pass) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.confirm.fill(confirm);
    await this.submit.click();
  }
}
