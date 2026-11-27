export type TokenKind = 'plain' | 'punct' | 'tag' | 'attr' | 'string';

export interface Token {
  text: string;
  kind: TokenKind;
}

const MARKUP = /(<\/?)([a-z]+)|(\s)([a-z-]+)(=)("[^"]*")|(\/?>)/g;

/**
 * Splits one line of Tosyn markup into tokens for colouring. Anything that is not a tag, an
 * attribute or a string stays plain.
 *
 * TOSYN-TODO(module: code element): plain TS for now. Replace it with the Tosyn code element.
 */
export function tokenizeMarkup(line: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of line.matchAll(MARKUP)) {
    const start = match.index;
    if (start > last) tokens.push({ text: line.slice(last, start), kind: 'plain' });
    if (match[2] !== undefined) {
      tokens.push({ text: match[1] ?? '', kind: 'punct' }, { text: match[2], kind: 'tag' });
    } else if (match[4] !== undefined) {
      tokens.push(
        { text: match[3] ?? '', kind: 'plain' },
        { text: match[4], kind: 'attr' },
        { text: match[5] ?? '', kind: 'punct' },
        { text: match[6] ?? '', kind: 'string' },
      );
    } else {
      tokens.push({ text: match[7] ?? '', kind: 'punct' });
    }
    last = start + match[0].length;
  }
  if (last < line.length) tokens.push({ text: line.slice(last), kind: 'plain' });
  return tokens;
}
