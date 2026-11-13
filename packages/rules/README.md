# @tosynui/rules

Design rules for Tosyn documents, and `checkDocument`, which runs the spec validator and then the
rules.

```ts
import { checkDocument } from '@tosynui/rules';

const { valid, findings } = checkDocument(document);
// valid is false when any finding is an error. Warnings are reported but allowed.
```

Rules run only on documents that pass the spec validator. Each finding has a `source` (`spec` or
`rules`), a `code`, a `severity`, a message that states the fix and a JSON Pointer `path`.

| Rule                       | Severity | Summary                                                      |
| -------------------------- | -------- | ------------------------------------------------------------ |
| `single-primary-action`    | error    | Give each section at most one primary action.                |
| `single-featured-section`  | warning  | Feature at most one section per screen.                      |
| `single-heading`           | error    | Give each section at most one heading.                       |
| `heading-first`            | warning  | Put a section's heading before its other content.            |
| `form-needs-heading`       | warning  | Give every top-level section that contains fields a heading. |
| `max-section-depth`        | error    | Nest sections at most 3 levels deep.                         |
| `navigate-needs-target`    | error    | Give every navigate action a target.                         |
| `target-requires-navigate` | warning  | Use target only on navigate actions.                         |
| `delete-not-primary`       | warning  | Do not make delete actions primary.                          |
| `submit-needs-field`       | warning  | Place submit actions in a section that has fields.           |
| `concise-action-label`     | warning  | Keep action labels to 5 words or fewer.                      |

Pass `{ rules }` to run a custom set. A rule is an object with an `id`, `severity`, `summary`,
`rationale` and a `check(visit, report)` function called once per element.
