import type { Client } from '@modelcontextprotocol/client';
import { renderGuide } from '@tosynui/ai';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { connect } from '../test/connect.js';

describe('design_screen prompt', () => {
  let client: Client;

  beforeEach(async () => {
    client = await connect();
  });

  afterEach(async () => {
    await client.close();
  });

  it('is listed with its argument', async () => {
    const { prompts } = await client.listPrompts();
    expect(prompts).toEqual([
      expect.objectContaining({
        name: 'design_screen',
        arguments: [expect.objectContaining({ name: 'description', required: true })],
      }),
    ]);
  });

  it('embeds the guide and asks for a checked screen', async () => {
    const result = await client.getPrompt({
      name: 'design_screen',
      arguments: { description: 'a login screen for pharmacy staff' },
    });
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0]?.content).toEqual({
      type: 'resource',
      resource: { uri: 'tosyn://guide', mimeType: 'text/markdown', text: renderGuide() },
    });
    const instruction = result.messages[1]?.content as { type: string; text: string };
    expect(instruction.text).toContain('a login screen for pharmacy staff');
    expect(instruction.text).toContain('check_markup');
  });
});
