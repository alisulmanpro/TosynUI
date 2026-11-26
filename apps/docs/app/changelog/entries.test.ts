import { describe, expect, it } from 'vitest';
import { changelog } from './entries';

describe('changelog', () => {
  it('has at least one entry, newest first, each with changes', () => {
    expect(changelog.length).toBeGreaterThan(0);
    for (const entry of changelog) {
      expect(entry.version.trim()).not.toBe('');
      expect(entry.changes.length).toBeGreaterThan(0);
    }
  });

  it('has no empty or duplicate lines', () => {
    const lines = changelog.flatMap((entry) => entry.changes);
    expect(lines.every((line) => line.trim().length > 0)).toBe(true);
    expect(new Set(lines).size).toBe(lines.length);
  });

  it('has balanced backticks so code spans render', () => {
    for (const line of changelog.flatMap((entry) => entry.changes)) {
      expect(line.split('`').length % 2).toBe(1);
    }
  });
});
