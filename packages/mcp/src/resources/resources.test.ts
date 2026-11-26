import { readFileSync, readdirSync } from 'node:fs';
import type { Client } from '@modelcontextprotocol/client';
import { renderGuide } from '@tosynui/ai';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { examples } from '../examples.generated.js';
import { connect } from '../test/connect.js';

const examplesDirectory = new URL('../../../../examples/', import.meta.url);

describe('resources', () => {
  let client: Client;

  beforeEach(async () => {
    client = await connect();
  });

  afterEach(async () => {
    await client.close();
  });

  it('serves the guide', async () => {
    const result = await client.readResource({ uri: 'tosyn://guide' });
    expect(result.contents).toEqual([
      { uri: 'tosyn://guide', mimeType: 'text/markdown', text: renderGuide() },
    ]);
  });

  it('serves the 0.2 guide, with result and feedback timing', async () => {
    const result = await client.readResource({ uri: 'tosyn://guide' });
    const text = (result.contents[0] as { text: string }).text;
    expect(text).toContain('Writing user interfaces in Tosyn 0.2');
    expect(text).toContain('<result');
    expect(text).toContain('after-submit');
  });

  it('serves the 0.2 examples that use result and after-submit', async () => {
    const bmi = await client.readResource({ uri: 'tosyn://examples/bmi-calculator' });
    expect((bmi.contents[0] as { text: string }).text).toContain('<result name="bmi"');
    const settings = await client.readResource({ uri: 'tosyn://examples/account-settings' });
    expect((settings.contents[0] as { text: string }).text).toContain('when="after-submit"');
  });

  it('lists the guide and every example', async () => {
    const { resources } = await client.listResources();
    expect(resources.map((resource) => resource.uri).sort()).toEqual([
      'tosyn://examples/account-settings',
      'tosyn://examples/bmi-calculator',
      'tosyn://examples/sign-in',
      'tosyn://guide',
    ]);
  });

  it('advertises the examples template', async () => {
    const { resourceTemplates } = await client.listResourceTemplates();
    expect(resourceTemplates.map((template) => template.uriTemplate)).toEqual([
      'tosyn://examples/{name}',
    ]);
  });

  it('serves an example by name', async () => {
    const result = await client.readResource({ uri: 'tosyn://examples/sign-in' });
    expect(result.contents[0]).toMatchObject({ mimeType: 'text/plain' });
    expect((result.contents[0] as { text: string }).text).toContain('<screen name="sign-in"');
  });

  it('rejects an unknown example', async () => {
    await expect(client.readResource({ uri: 'tosyn://examples/nope' })).rejects.toThrow(
      /No example named "nope"/,
    );
  });

  it('completes example names', async () => {
    const result = await client.complete({
      ref: { type: 'ref/resource', uri: 'tosyn://examples/{name}' },
      argument: { name: 'name', value: 's' },
    });
    expect(result.completion.values).toEqual(['sign-in']);
  });
});

describe('examples.generated.ts', () => {
  it('matches the files in examples/; run pnpm generate if this fails', () => {
    const files = readdirSync(examplesDirectory).filter((file) => file.endsWith('.tosyn'));
    const onDisk = Object.fromEntries(
      files.map((file) => [
        file.slice(0, -'.tosyn'.length),
        readFileSync(new URL(file, examplesDirectory), 'utf8'),
      ]),
    );
    expect(examples).toEqual(onDisk);
  });
});
