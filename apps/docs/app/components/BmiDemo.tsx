'use client';

import type { FormEvent } from 'react';

/**
 * The BMI calculator from `content.ts`, drawn by Tosyn and made to work.
 *
 * TOSYN-TODO(module: submit handling): the renderer draws a form but has no way to run code when
 * it is submitted, so this component does the sum itself. Replace it when render-html can call a
 * handler and fill a `result`.
 */
export function BmiDemo({ html }: { html: string }) {
  function onSubmit(event: FormEvent<HTMLDivElement>) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const height = Number(new FormData(form).get('height'));
    const weight = Number(new FormData(form).get('weight'));
    const output = event.currentTarget.querySelector<HTMLOutputElement>('output[name="bmi"]');
    if (!output) return;
    output.value = height > 0 && weight > 0 ? (weight / (height / 100) ** 2).toFixed(1) : '—';
  }

  return (
    <div
      className="blk blk-demo"
      onSubmit={onSubmit}
      // The markup is checked at build time and comes from content.ts, so the HTML is trusted.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
