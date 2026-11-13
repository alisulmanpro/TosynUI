import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

function preview(page: Page) {
  return page.frameLocator('#preview');
}

test('renders the default example', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Write intent, see the interface' }),
  ).toBeVisible();
  await expect(page.locator('#status')).toHaveText('Valid. No problems found.');
  await expect(
    preview(page).getByRole('heading', { level: 1, name: 'BMI calculator' }),
  ).toBeVisible();
  await expect(preview(page).getByLabel('Height')).toBeVisible();
  await expect(preview(page).getByRole('button', { name: 'Calculate BMI' })).toBeVisible();
});

test('switches examples and themes', async ({ page }) => {
  await page.getByLabel('Example').selectOption('sign-in');
  await expect(preview(page).getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(preview(page).getByRole('link', { name: 'Create an account' })).toBeVisible();

  await page.getByLabel('Theme').selectOption('dark');
  await expect(preview(page).locator('body')).toHaveAttribute('data-theme', 'dark');
});

test('lists findings with their line and keeps the last valid preview', async ({ page }) => {
  await page
    .getByLabel('Tosyn markup')
    .fill(
      [
        '<screen name="demo" purpose="Show findings.">',
        '  <section name="main">',
        '    <action intent="submit" importance="primary" color="blue">Save</action>',
        '  </section>',
        '</screen>',
      ].join('\n'),
    );
  await expect(page.locator('#status')).toContainText('1 error');
  const finding = page.locator('#findings li').first();
  await expect(finding).toContainText('unknown-attribute');
  await expect(finding.getByRole('button')).toHaveText('3:5');
  await expect(preview(page).getByRole('heading', { name: 'BMI calculator' })).toBeVisible();
  await expect(page.locator('#preview')).toHaveClass(/stale/);
});

test('shows design-rule warnings without blocking the preview', async ({ page }) => {
  await page
    .getByLabel('Tosyn markup')
    .fill(
      '<screen name="demo" purpose="Warn."><section name="main"><heading>Danger</heading><action intent="delete" importance="primary">Delete</action></section></screen>',
    );
  await expect(page.locator('#status')).toHaveText('Valid, with 1 warning.');
  await expect(page.locator('#findings')).toContainText('delete-not-primary');
  await expect(preview(page).getByRole('button', { name: 'Delete' })).toBeVisible();
});

test('reports unclosed tags', async ({ page }) => {
  await page.getByLabel('Tosyn markup').fill('<screen name="a" purpose="p"><section name="s">');
  await expect(page.locator('#findings')).toContainText('syntax-error');
});
