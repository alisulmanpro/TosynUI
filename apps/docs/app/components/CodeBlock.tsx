'use client';

import { useState } from 'react';
import { tokenizeMarkup } from '../highlight';
import { plain } from '../marks';

interface CodeBlockProps {
  /** The code to show and to copy. */
  source: string;
  /** `markup` colours Tosyn tags and attributes; `text` shows the code as it is. */
  language?: 'markup' | 'text';
  label: string;
}

/**
 * Code with a Copy button.
 *
 * TOSYN-TODO(module: code element): plain TS for now. Replace it with the Tosyn code element.
 */
export function CodeBlock({ source, language = 'text', label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Copying can be blocked by the browser; the code stays selectable by hand.
    }
  }

  return (
    <div className="code" {...plain('code element', 'Code block with copy button')}>
      <pre tabIndex={0} aria-label={label}>
        <code>
          {source.split('\n').map((line, index) => (
            <span key={index} className="code-line">
              {language === 'markup'
                ? tokenizeMarkup(line).map((token, tokenIndex) => (
                    <span key={tokenIndex} className={`tok-${token.kind}`}>
                      {token.text}
                    </span>
                  ))
                : line}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
      <button type="button" className="code-copy" onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
        <span className="visually-hidden" aria-live="polite">
          {copied ? ' to the clipboard' : ''}
        </span>
      </button>
    </div>
  );
}
