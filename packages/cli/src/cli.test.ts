import { describe, expect, it } from 'vitest';
import { USAGE, VERSION, checkMarkup, run } from './index.js';
import type { Io } from './index.js';

const VALID = `<screen name="s" purpose="p">
  <section name="a">
    <heading>Hello</heading>
    <text>World</text>
  </section>
</screen>`;

const WARNING = `<screen name="s" purpose="p">
  <section name="a">
    <action intent="delete" importance="primary">Delete</action>
  </section>
</screen>`;

const INVALID = `<screen name="s" purpose="p">
  <section name="a">
    <action intent="go">Next</action>
  </section>
</screen>`;

function memoryIo(files: Record<string, string> = {}) {
  const out: string[] = [];
  const err: string[] = [];
  const written: Record<string, string> = {};
  const io: Io = {
    stdout: (text) => out.push(text),
    stderr: (text) => err.push(text),
    readFile: async (path) => {
      const content = files[path];
      if (content === undefined) throw new Error('ENOENT');
      return content;
    },
    writeFile: async (path, text) => {
      written[path] = text;
    },
  };
  return { io, out: () => out.join(''), err: () => err.join(''), written };
}

describe('tosyn check', () => {
  it('passes valid files', async () => {
    const { io, out } = memoryIo({ 'ok.tosyn': VALID });
    expect(await run(['check', 'ok.tosyn'], io)).toBe(0);
    expect(out()).toBe('1 file checked: 0 errors, 0 warnings.\n');
  });

  it('reports warnings without failing', async () => {
    const { io, out } = memoryIo({ 'warn.tosyn': WARNING });
    expect(await run(['check', 'warn.tosyn'], io)).toBe(0);
    expect(out()).toContain('warn.tosyn:3:5  warning  delete-not-primary');
    expect(out()).toContain('0 errors, 1 warning.');
  });

  it('fails on errors and points at the source line', async () => {
    const { io, out } = memoryIo({ 'bad.tosyn': INVALID, 'ok.tosyn': VALID });
    expect(await run(['check', 'bad.tosyn', 'ok.tosyn'], io)).toBe(1);
    expect(out()).toContain('bad.tosyn:3:5  error    invalid-attribute-value');
    expect(out()).toContain('2 files checked: 1 error, 0 warnings.');
  });

  it('prints JSON reports', async () => {
    const { io, out } = memoryIo({ 'bad.tosyn': INVALID });
    expect(await run(['check', '--format', 'json', 'bad.tosyn'], io)).toBe(1);
    expect(JSON.parse(out())).toEqual([
      expect.objectContaining({
        file: 'bad.tosyn',
        valid: false,
        findings: [expect.objectContaining({ code: 'invalid-attribute-value', line: 3 })],
      }),
    ]);
  });

  it('rejects bad usage', async () => {
    expect(await run(['check'], memoryIo().io)).toBe(2);
    expect(await run(['check', '--format', 'xml', 'a'], memoryIo({ a: VALID }).io)).toBe(2);
    expect(await run(['check', 'missing.tosyn'], memoryIo().io)).toBe(2);
  });
});

describe('tosyn render', () => {
  it('writes a themed page', async () => {
    const { io, written } = memoryIo({ 'ok.tosyn': VALID });
    expect(await run(['render', 'ok.tosyn', '--theme', 'dark', '-o', 'out.html'], io)).toBe(0);
    expect(written['out.html']).toContain('<body data-tosyn data-theme="dark">');
    expect(written['out.html']).toContain('<h1 class="ts-heading"');
  });

  it('refuses to render invalid markup', async () => {
    const { io, err } = memoryIo({ 'bad.tosyn': INVALID });
    expect(await run(['render', 'bad.tosyn'], io)).toBe(2);
    expect(err()).toContain('bad.tosyn:3:5');
    expect(err()).toContain('fix them before rendering');
  });

  it('validates its arguments', async () => {
    expect(await run(['render'], memoryIo().io)).toBe(2);
    expect(await run(['render', 'a', '--theme', 'blue'], memoryIo({ a: VALID }).io)).toBe(2);
    expect(await run(['render', 'missing'], memoryIo().io)).toBe(2);
  });
});

describe('other commands', () => {
  it('prints the guide and the stylesheet', async () => {
    const guide = memoryIo();
    expect(await run(['guide'], guide.io)).toBe(0);
    expect(guide.out()).toMatch(/^# Writing user interfaces in Tosyn/);

    const css = memoryIo();
    expect(await run(['css', '-o', 'tosyn.css'], css.io)).toBe(0);
    expect(css.written['tosyn.css']).toContain('@layer tosyn.tokens, tosyn.components');
  });

  it('prints help and version', async () => {
    const help = memoryIo();
    expect(await run(['--help'], help.io)).toBe(0);
    expect(help.out()).toBe(USAGE);

    const version = memoryIo();
    expect(await run(['-v'], version.io)).toBe(0);
    expect(version.out()).toBe(`${VERSION}\n`);
  });

  it('rejects unknown commands, options and missing commands', async () => {
    expect(await run(['deploy'], memoryIo().io)).toBe(2);
    expect(await run(['--colour'], memoryIo().io)).toBe(2);
    const empty = memoryIo();
    expect(await run([], empty.io)).toBe(2);
    expect(empty.err()).toBe(USAGE);
  });
});

describe('checkMarkup', () => {
  it('reports parse errors without running the rules', () => {
    const result = checkMarkup('<screen name="s" purpose="p"><section name="a">');
    expect(result.valid).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toEqual([
      'syntax-error',
      'syntax-error',
    ]);
  });
});
