import { describe, expect, it } from 'vitest';
import { renderTokens } from './pipeline.js';

describe('token CSS generation', () => {
  it('sorts nested token names and emits scoped readable custom properties', () => {
    expect(
      renderTokens({
        spacing: { md: '1rem', sm: '0.5rem' },
        color: { surface: '#fff' },
      }),
    ).toBe(
      '[data-tosyn] {\n  --tosyn-color-surface: #fff;\n  --tosyn-spacing-md: 1rem;\n  --tosyn-spacing-sm: 0.5rem;\n}\n',
    );
  });
});
