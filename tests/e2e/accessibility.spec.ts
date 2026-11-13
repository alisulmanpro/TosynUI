import { readFileSync, readdirSync } from 'node:fs';
import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { parseMarkup } from '@tosynui/parser';
import { renderPage } from '@tosynui/render-html';
import type { Theme } from '@tosynui/render-html';

const examplesDirectory = new URL('../../examples/', import.meta.url);
const examples = readdirSync(examplesDirectory).filter((file) => file.endsWith('.tosyn'));
const themes: Theme[] = ['light', 'dark'];

for (const file of examples) {
  for (const theme of themes) {
    test(`${file} has no axe violations in the ${theme} theme`, async ({ page }) => {
      const { document } = parseMarkup(readFileSync(new URL(file, examplesDirectory), 'utf8'));
      await page.setContent(renderPage(document!, { theme }));
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });
  }
}

test('focus is visible on fields and actions', async ({ page }) => {
  const { document } = parseMarkup(
    readFileSync(new URL('sign-in.tosyn', examplesDirectory), 'utf8'),
  );
  await page.setContent(renderPage(document!, { theme: 'light' }));
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Email address')).toBeFocused();
  const control = page.locator('.ts-control').first();
  await expect(control).not.toHaveCSS('outline-style', 'none');

  await page.getByRole('button', { name: 'Sign in' }).focus();
  await expect(page.getByRole('button', { name: 'Sign in' })).not.toHaveCSS(
    'outline-style',
    'none',
  );
});
