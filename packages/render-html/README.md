# @tosynui/render-html

Renders Tosyn documents to accessible HTML and CSS.

```ts
import { renderDocument, renderPage, stylesheet } from '@tosynui/render-html';

const fragment = renderDocument(document); // <main class="ts-screen" data-tosyn>…</main>
const page = renderPage(document, { theme: 'dark' }); // standalone page, styles inlined
const css = stylesheet(); // theme variables and component styles
```

The output uses native elements only and works without JavaScript:

| Tosyn      | HTML                                                                 |
| ---------- | -------------------------------------------------------------------- |
| `screen`   | `<main>`                                                             |
| `section`  | `<section aria-labelledby>`; wrapped content in `<form>` with fields |
| `heading`  | `<h1>`–`<h6>`, level derived from position                           |
| `text`     | `<p>`                                                                |
| `field`    | `<label>` + `<input>` or `<textarea>`, unit and hint described       |
| `action`   | `<button type>` or, for `navigate`, `<a href>`                       |
| `feedback` | `<div role="status">`, or `role="alert"` for errors                  |

Component styles are in `styles.css`, in the `tosyn.components` layer, with zero-specificity
`:where()` selectors. Any class in your own stylesheet overrides them without `!important`.
Run `pnpm generate` after editing `styles.css` to update `styles.generated.ts`.
