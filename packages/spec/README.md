# @tosynui/spec

The Tosyn intent language: the element catalog, the JSON Schemas for catalogs and documents, and a
validator that reports every problem with a stable code, a JSON Pointer and a message that states
the fix.

## Usage

```ts
import { validateDocument } from '@tosynui/spec';

const result = validateDocument(document);
if (!result.valid) {
  for (const { code, path, message } of result.diagnostics) {
    console.log(`${code} at ${path}: ${message}`);
  }
}
```

Validation has two stages. The document schema checks the shape of the tree and stops there if it
is wrong. The catalog then checks elements, attributes, nesting, content and unique values.

## Exports

| Specifier                            | Contents                                     |
| ------------------------------------ | -------------------------------------------- |
| `@tosynui/spec`                      | `validateDocument`, `validateCatalog`, types |
| `@tosynui/spec/catalog.json`         | The element catalog                          |
| `@tosynui/spec/schema/catalog.json`  | JSON Schema for catalogs                     |
| `@tosynui/spec/schema/document.json` | JSON Schema for documents (the IR)           |
| `@tosynui/spec/examples/<name>.json` | Example documents                            |

## Diagnostic codes

| Code                      | Meaning                                                  |
| ------------------------- | -------------------------------------------------------- |
| `invalid-structure`       | The document does not match the document schema.         |
| `unsupported-version`     | The document's `tosyn` version differs from the catalog. |
| `invalid-root`            | The document does not start with the root element.       |
| `unknown-element`         | The element is not defined in the catalog.               |
| `unknown-attribute`       | The element has no such attribute.                       |
| `missing-attribute`       | A required attribute is absent.                          |
| `invalid-attribute-value` | The value has the wrong type or is not allowed.          |
| `invalid-child`           | The content is not allowed in this element.              |
| `empty-content`           | An element that needs text has none.                     |
| `duplicate-value`         | A value that must be unique is used twice.               |
