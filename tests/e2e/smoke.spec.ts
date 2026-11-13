import { expect, test } from '@playwright/test';

test.describe('playground', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto('/');
    expect(errors).toEqual([]);
  });

  test('loads the example document as valid', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Validate an intent document' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('Valid Tosyn document.');
  });

  test('reports diagnostics for an invalid document', async ({ page }) => {
    const editor = page.getByLabel('Document (JSON)');
    const invalid = JSON.stringify({
      tosyn: '0.1',
      root: {
        element: 'screen',
        attributes: { name: 'demo', purpose: 'Show a validation error.' },
        children: [
          {
            element: 'section',
            attributes: { name: 'main' },
            children: [{ element: 'action', attributes: { intent: 'submit', color: 'blue' } }],
          },
        ],
      },
    });
    await editor.fill(invalid);
    await expect(page.getByRole('status')).toHaveText('2 problems found.');
    await expect(page.getByRole('listitem')).toHaveCount(2);
    await expect(page.getByRole('listitem').first()).toContainText('unknown-attribute');
  });

  test('reports malformed JSON', async ({ page }) => {
    await page.getByLabel('Document (JSON)').fill('{');
    await expect(page.getByRole('status')).toContainText('Not valid JSON');
  });
});
