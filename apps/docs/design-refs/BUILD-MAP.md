# Build map

What the Tosyn website builds with Tosyn today, and what is plain TypeScript until the library has a
module for it. Each module name below is the name used in the `TOSYN-TODO(module: …)` comments.

## Built with Tosyn today

| Part                                              | Where      | Tosyn elements                                   |
| ------------------------------------------------- | ---------- | ------------------------------------------------ |
| Hero, section titles, step texts, calls to action | every page | `screen`, `section`, `heading`, `text`, `action` |
| BMI calculator demo                               | home       | `field`, `action`, `result`                      |
| Sign-in example (shown as code)                   | docs       | `field`, `action`, `feedback`                    |

All of it is in `app/content.ts`. A test checks every block with the Tosyn checker, so a block with an
error or a warning fails the tests and the build.

## Plain TypeScript for now

| Module name            | Part of the website                                | Used on            | What the library needs                                                                               |
| ---------------------- | -------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `navigation`           | Top bar, docs sidebar and "on this page" list      | all pages, docs    | A navigation element (with a current-page state). Search is a later addition.                        |
| `footer`               | Footer with link columns                           | all pages          | A footer or link-list element.                                                                       |
| `layout`               | Three-column steps, two-by-two cards               | home, for AI       | A layout or grid element.                                                                            |
| `code element`         | Code block with a Copy button and colouring        | home, docs, for AI | A code element.                                                                                      |
| `table`                | Element, rule and API tables                       | docs, for AI       | A table element.                                                                                     |
| `badge`                | The small label above the headline                 | home, for AI       | A badge element.                                                                                     |
| `window frame`         | The window around the code and the live demo       | home               | A frame element in the renderer.                                                                     |
| `swatch`               | Brand colour swatches                              | docs               | A swatch or token-preview element.                                                                   |
| `timeline`             | Release list                                       | changelog          | A list or timeline element.                                                                          |
| `submit handling`      | Making the BMI demo calculate                      | home               | A way for `render-html` to run code on submit and fill a `result`.                                   |
| `render-html fragment` | `renderBlock` rewrites `<main>` and heading levels | all pages          | Options in `render-html` for a plain container instead of `<main>`, and for the first heading level. |

When a module arrives, replace the plain code, delete its `TOSYN-TODO` comment, and remove its row
from the second table.
