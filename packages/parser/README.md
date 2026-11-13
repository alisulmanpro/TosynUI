# @tosynui/parser

Parses Tosyn markup into the intermediate representation (IR) defined by `@tosynui/spec`.

```ts
import { attachLocations, parseMarkup } from '@tosynui/parser';
import { validateDocument } from '@tosynui/spec';

const { document, locations, diagnostics } = parseMarkup(source);
const problems = attachLocations(validateDocument(document).diagnostics, locations);
// Each problem now has line and column in the original markup.
```

The parser is forgiving so that models and people can write natural markup:

- self-closing tags (`<field ... />`) and explicit closing tags are equivalent;
- element and attribute names are lower-cased, entities are decoded and comments are ignored;
- whitespace in text is collapsed, and whitespace between elements is dropped;
- boolean attributes are read from the catalog (`required`, `required="true"`, `required="false"`);
- `<screen tosyn="0.1">` sets the language version; otherwise the catalog version is used.

Unknown elements and attributes are kept, so the validator can explain them. The parser itself
reports only `syntax-error` (unclosed elements), `invalid-root` (no root or more than one) and
`invalid-child` (text outside the root).
