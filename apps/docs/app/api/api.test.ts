import { describe, expect, it } from 'vitest';
import * as check from './check/route';
import * as render from './render/route';
import { MAX_BODY_LENGTH, MAX_MARKUP_LENGTH } from './_shared/http';

const VALID = `<screen name="demo" purpose="Show the API.">
  <section name="main">
    <heading>Hello</heading>
    <field name="email" label="Email" kind="email" required />
    <action intent="submit" importance="primary">Send</action>
  </section>
</screen>`;

function post(route: { POST(request: Request): Promise<Response> }, body: unknown, raw = false) {
  return route.POST(
    new Request('https://docs.test/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: raw ? String(body) : JSON.stringify(body),
    }),
  );
}

describe('POST /api/check', () => {
  it('accepts valid markup', async () => {
    const response = await post(check, { markup: VALID });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      specVersion: '0.2',
      valid: true,
      errors: 0,
      warnings: 0,
      findings: [],
    });
  });

  it('reports errors with line, column and how to fix them, as a normal answer', async () => {
    const response = await post(check, {
      markup: VALID.replace('importance="primary"', 'importance="primary" color="blue"'),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ valid: false, errors: 1, warnings: 0 });
    expect(body.findings[0]).toMatchObject({
      severity: 'error',
      code: 'unknown-attribute',
      line: 5,
      column: 5,
    });
    expect(body.findings[0].message).toContain('color');
  });

  it('reports syntax errors and warnings', async () => {
    const broken = await (
      await post(check, { markup: '<screen name="a" purpose="p"><section name="s">' })
    ).json();
    expect(broken.valid).toBe(false);
    expect(broken.findings[0].code).toBe('syntax-error');

    const warned = await (
      await post(check, {
        markup:
          '<screen name="a" purpose="p"><section name="s"><heading>H</heading><result name="r" label="R" /></section></screen>',
      })
    ).json();
    expect(warned).toMatchObject({ valid: true, errors: 0, warnings: 1 });
    expect(warned.findings[0].code).toBe('result-needs-submit');
  });

  it.each([
    ['not json', 'nope', true, 400, /must be JSON/],
    ['an array', [], false, 400, /JSON object/],
    ['no markup', {}, false, 400, /"markup" field/],
    ['markup that is not a string', { markup: 5 }, false, 400, /"markup" field/],
    ['too much markup', { markup: 'x'.repeat(MAX_MARKUP_LENGTH + 1) }, false, 413, /too long/],
    ['too large a body', { markup: '', pad: 'x'.repeat(MAX_BODY_LENGTH) }, false, 413, /too large/],
  ])('rejects %s', async (_name, body, raw, status, message) => {
    const response = await post(check, body, raw);
    expect(response.status).toBe(status);
    expect((await response.json()).error).toMatch(message);
  });

  it('rejects a declared size that is too large without reading it', async () => {
    const response = await check.POST(
      new Request('https://docs.test/api', {
        method: 'POST',
        headers: { 'Content-Length': String(MAX_BODY_LENGTH + 1) },
        body: '{}',
      }),
    );
    expect(response.status).toBe(413);
  });

  it('allows any website to call it, and answers preflight', async () => {
    const response = await post(check, { markup: VALID });
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(response.headers.get('cache-control')).toBe('no-store');
    const preflight = check.OPTIONS();
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('access-control-allow-methods')).toContain('POST');
    expect(preflight.headers.get('access-control-allow-headers')).toContain('Content-Type');
  });

  it('says to use POST for GET', async () => {
    const response = check.GET();
    expect(response.status).toBe(405);
    expect((await response.json()).error).toContain('POST');
  });
});

describe('POST /api/render', () => {
  it('renders valid markup as a complete page', async () => {
    const response = await post(render, { markup: VALID });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ specVersion: '0.2', rendered: true, valid: true });
    expect(body.html).toMatch(/^<!doctype html>/);
    expect(body.html).toContain('class="ts-heading" id="demo-main-heading">Hello</h1>');
    expect(body.html).toContain('<body data-tosyn>');
  });

  it('renders the language 0.2 elements', async () => {
    const markup = VALID.replace(
      '<action',
      '<result name="total" label="Total" unit="kg" /><feedback tone="success" when="after-submit">Sent</feedback><action',
    );
    const { html } = await (await post(render, { markup })).json();
    expect(html).toContain('<output class="ts-output" name="total"');
    expect(html).toContain('data-when="after-submit" hidden');
  });

  it('applies the theme and brand', async () => {
    const { html } = await (
      await post(render, { markup: VALID, theme: 'dark', brand: 'ocean' })
    ).json();
    expect(html).toContain('<body data-tosyn data-theme="dark" data-brand="ocean">');
    expect(html).toContain('--tosyn-color-accent: #006688;');
  });

  it('does not render markup with errors, and returns the findings with 422', async () => {
    const response = await post(render, {
      markup: '<screen name="a" purpose="p"><button /></screen>',
    });
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body).toMatchObject({ rendered: false, valid: false });
    expect(body.html).toBeUndefined();
    expect(body.findings[0].code).toBe('unknown-element');
  });

  it.each([
    [{ markup: VALID, theme: 'sepia' }, /"theme" must be one of: light, dark, system/],
    [{ markup: VALID, theme: 3 }, /"theme"/],
    [{ markup: VALID, brand: 'gold' }, /"brand" must be one of: ocean, forest/],
    [{ markup: VALID, brand: 'constructor' }, /"brand" must be one of/],
    [{ markup: VALID, brand: 4 }, /"brand"/],
    [{}, /"markup" field/],
  ])('rejects %j', async (body, message) => {
    const response = await post(render, body);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(message);
  });

  it('allows any website to call it', async () => {
    expect((await post(render, { markup: VALID })).headers.get('access-control-allow-origin')).toBe(
      '*',
    );
    expect(render.OPTIONS().status).toBe(204);
    expect(render.GET().status).toBe(405);
  });
});
