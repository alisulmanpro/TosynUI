import { expect, test } from '@playwright/test';

for (const fixture of [
  {
    name: 'plain HTML playground',
    url: 'http://127.0.0.1:4173',
    heading: 'Plain HTML can consume TosynUI CSS.',
  },
  {
    name: 'React fixture',
    url: 'http://127.0.0.1:4174',
    heading: 'React can consume the same standalone CSS.',
  },
]) {
  test(`${fixture.name} renders the setup demonstration`, async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto(fixture.url);
    await expect(page.getByRole('heading', { name: fixture.heading })).toBeVisible();
    const root = page.locator('[data-tosyn]');
    await expect(root).toBeVisible();
    await expect(root.getByRole('button')).toBeVisible();
    await expect(root.getByRole('button')).toHaveCSS('background-color', 'rgb(49, 94, 251)');
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}
