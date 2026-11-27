# Design references

These are the approved designs for the Tosyn website (Concept A, light theme), kept next to the code
that implements them. Each picture is a screenshot of one board in the design canvas.

| File               | Page                      | Route in `app/`          |
| ------------------ | ------------------------- | ------------------------ |
| `01-home.png`      | Home                      | `app/page.tsx`           |
| `02-docs.png`      | Docs (language reference) | `app/docs/page.tsx`      |
| `03-for-ai.png`    | For AI                    | `app/for-ai/page.tsx`    |
| `04-changelog.png` | Changelog                 | `app/changelog/page.tsx` |
| `05-build-map.png` | Build map (internal)      | none: see `BUILD-MAP.md` |

The designs are a reference, not a pixel spec. Where the code and a picture differ, the code is
current. Differences made on purpose are listed at the end of this file.

## The two kinds of marking

The pictures have dashed outlines with a small label on each part.

- **Violet dashed outline: written in Tosyn.** The text is Tosyn markup in `app/content.ts`. A page
  draws it with `TosynBlock`, which checks it and renders it with `@tosynui/render-html`.
- **Amber dashed outline: plain TypeScript for now.** The library cannot draw this part yet. It is
  written as an ordinary React component or markup, and it must be replaced when the module arrives.

## The TOSYN-TODO convention

Every plain TypeScript part carries one comment in the code:

```ts
// TOSYN-TODO(module: navigation): plain TS for now.
// Replace with the Tosyn navigation element when it ships.
```

To find everything that is waiting for the library:

```sh
grep -rn "TOSYN-TODO" apps/docs/app
```

`BUILD-MAP.md` lists every module name used in those comments and what the library needs. A test
(`app/website.test.ts`) fails if a comment names a module that `BUILD-MAP.md` does not list, so the
two cannot drift apart.

## Differences from the pictures

- The docs sidebar links only to pages that exist. The pictures show Quick start, Renderers and CLI,
  which are not written yet.
- The search box and the previous and next links are not built, because there is nothing to search
  or page through yet.
- The docs page has an extra section, "Element details", so no information from the old reference
  page was lost.
- The Violet brand is applied as colour variables in `app/globals.css`. It becomes a tokens file
  when the brand work is added to the library.
- The changelog has no "Next release: nothing yet" block. While there are unreleased changes, the
  "Next release" entry is the first item and says "Not released yet".
- The pictures were drawn at 1440 pixels wide. The code also works on small screens.
