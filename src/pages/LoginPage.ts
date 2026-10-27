import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly flash: Locator;

  constructor(private readonly page: Page) {
    this.username = page.locator('#username');
    this.password = page.locator('#password');
    this.submit = page.getByRole('button', { name: 'Login' });
    this.flash = page.locator('#flash');
  }

  async goto() {
    await this.page.goto('/login');
    await expect(this.username).toBeVisible();
  }

  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
  }
}
