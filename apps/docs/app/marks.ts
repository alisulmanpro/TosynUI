/**
 * Build marks: the dashed outlines the site can show on each part.
 *
 * A violet outline means the part is written in Tosyn. An amber outline means it is plain
 * TypeScript for now and waits for a library module. The marks are always in the HTML as data
 * attributes; `BuildMarks` turns the outlines on and off, and `globals.css` draws them.
 */

export interface Mark {
  'data-made': 'tosyn' | 'plain';
  'data-made-label': string;
  'data-module'?: string;
}

/** Marks a part that is plain TypeScript until the library has `module`. */
export function plain(module: string, label: string): Mark {
  return { 'data-made': 'plain', 'data-made-label': `${label}: plain TS`, 'data-module': module };
}

/** Marks a part that is written in Tosyn. `elements` are the Tosyn elements it uses. */
export function tosyn(elements: readonly string[]): Mark {
  return { 'data-made': 'tosyn', 'data-made-label': `Written in Tosyn: ${elements.join(', ')}` };
}

/** The Tosyn elements a block uses, in order of first use, without `screen` and `section`. */
export function elementsUsed(markup: string): string[] {
  const names = new Set<string>();
  for (const match of markup.matchAll(/<([a-z]+)[\s/>]/g)) {
    const name = match[1]!;
    if (name !== 'screen' && name !== 'section') names.add(name);
  }
  return [...names];
}
