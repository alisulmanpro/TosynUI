import { describe, expect, it } from 'vitest';
import { validateComponentContract } from './index.js';

const validContract = {
  schemaVersion: '0.1',
  id: 'setup-demo',
  version: '0.1.0',
  description: 'A setup-only contract used to verify validation infrastructure.',
  styling: { baseClass: 'setup-demo-button', modifiers: [] },
  structure: { rootElement: 'button', requiredAttributes: ['type'] },
};

describe('component contract validation', () => {
  it('accepts the setup demonstration contract', () => {
    expect(validateComponentContract(validContract).valid).toBe(true);
  });

  it('rejects unknown fields and malformed versions', () => {
    const result = validateComponentContract({
      ...validContract,
      version: 'next',
      unexpected: true,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
