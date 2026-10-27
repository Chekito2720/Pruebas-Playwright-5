import { test as base, expect } from '@playwright/test';

/** Bloquea anuncios y trackers para que no tapen elementos ni ralenticen las pruebas. */
const BLOCKED =
  /(googlesyndication|doubleclick|googleadservices|google-analytics|googletagmanager|adsbygoogle|pagead2|buymeacoffee)/;

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(BLOCKED, (route) => route.abort());
    await use(page);
  },
});

export { expect };
