import { elementsUsed, tosyn } from '../marks';
import { renderBlock } from '../tosyn-block';
import type { BlockOptions } from '../tosyn-block';

interface TosynBlockProps extends BlockOptions {
  /** Tosyn markup. Written in this repository, never typed by a visitor. */
  markup: string;
  className?: string;
  /** True inside a plain TS container that already carries the mark. */
  nested?: boolean;
}

/** Part of a page written in Tosyn and drawn by `@tosynui/render-html`. */
export function TosynBlock({ markup, className, nested, ...options }: TosynBlockProps) {
  return (
    <div
      {...(nested ? {} : tosyn(elementsUsed(markup)))}
      className={className ? `blk ${className}` : 'blk'}
      // The markup is checked at build time and comes from content.ts, so the HTML is trusted.
      dangerouslySetInnerHTML={{ __html: renderBlock(markup, options) }}
    />
  );
}
