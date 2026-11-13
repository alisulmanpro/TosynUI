# Writing user interfaces in Tosyn 0.1

Tosyn is an intent language for user interfaces. You describe what each part of a screen does and how important it is. You never describe how it looks: renderers and design rules decide colours, spacing, typography and layout, so every screen stays consistent and accessible.

## How to answer

- Write exactly one `<screen>` element per screen, inside a code block tagged `html`.
- Use only the elements and attributes listed below. Never add `class`, `style`, `id`, colours, sizes or any other visual detail; they are errors in Tosyn.
- Never choose heading levels. Use `<heading>`; its level comes from where its section sits.
- Write labels and copy as the final text a person will read.
- Self-closing tags are fine for elements without content, for example `<field ... />`.
- If you receive diagnostics or rule findings for your markup, fix every one and return the whole corrected screen.

## Example

```html
<screen name="bmi-calculator" purpose="Work out body mass index from height and weight.">
  <section name="inputs" emphasis="featured">
    <heading>BMI calculator</heading>
    <text>Enter your height and weight to see your BMI.</text>
    <field name="height" label="Height" kind="number" unit="cm" required />
    <field name="weight" label="Weight" kind="number" unit="kg" required />
    <action intent="submit" importance="primary">Calculate BMI</action>
    <action intent="reset" importance="tertiary">Clear</action>
  </section>

  <section name="result">
    <heading>Your result</heading>
    <feedback tone="info">Your BMI will appear here.</feedback>
    <text tone="muted">BMI is a screening measure, not a diagnosis.</text>
  </section>
</screen>
```

## Elements

### `<screen>`

The root of one complete interface: a page, a view or an app screen.

Every document has exactly one screen. State in `purpose` what the person using it is trying to get done; renderers and design rules read it.

- Content: `<section>`
- `name`: kebab-case identifier (required). Stable, kebab-case identifier for the screen.
- `purpose`: text (required). One sentence describing what the user accomplishes on this screen.

### `<section>`

A region of the screen that groups content serving one goal.

Sections may be nested. Heading levels are derived from section depth, so authors never choose a heading level by hand.

- Content: `<section>`, `<heading>`, `<text>`, `<field>`, `<action>`, `<feedback>`
- `name`: kebab-case identifier (required, unique within the screen). Stable, kebab-case identifier for the section. Unique within the screen.
- `emphasis`: `default` | `featured` | `subdued` (default `default`). How strongly the section should stand out from its siblings.

### `<heading>`

The title of the section that contains it.

Its level comes from the section depth. Use at most one heading per section.

- Content: text only

### `<text>`

A paragraph of explanatory or supporting copy.

Use `tone="muted"` for secondary copy such as notes and fine print.

- Content: text only
- `tone`: `default` | `muted` (default `default`). Visual weight of the copy.

### `<field>`

A single input that collects one value from the user.

Every field needs a visible `label`. Use `unit` for measured values (for example `kg` or `m`) instead of writing the unit into the label.

- Content: none
- `name`: kebab-case identifier (required, unique within the screen). Stable identifier for the submitted value. Unique within the screen.
- `label`: text (required). Visible label that names the value.
- `kind`: `text` | `number` | `email` | `password` | `tel` | `date` | `multiline` (default `text`). The kind of value collected, which selects the input control.
- `required`: present or absent (default `false`). Whether a value must be provided.
- `hint`: text. Short help text shown with the field.
- `unit`: text. Unit of measurement for the value, such as `kg`, `mm` or `PKR`.

### `<action>`

Something the user can do: submit, navigate, reset, cancel or delete.

Describe what happens with `intent` and how important it is with `importance`; never describe how it looks. Its text content is the accessible label.

- Content: text only
- `intent`: `submit` | `navigate` | `reset` | `cancel` | `delete` (required). What happens when the action is taken.
- `importance`: `primary` | `secondary` | `tertiary` (default `secondary`). How important the action is relative to others in the same section.
- `target`: text. Destination of a `navigate` action, such as a path or screen name.

### `<feedback>`

A message that reports a result, status or problem to the user.

Pick `tone` by meaning, not by colour. Renderers announce feedback to assistive technology.

- Content: text only
- `tone`: `info` | `success` | `warning` | `error` (required). The meaning of the message.

## Design rules

Errors make a screen invalid. Fix warnings unless you have a clear reason not to.

- **single-primary-action** (error): Give each section at most one primary action. A primary action tells people what to do next. Two primary actions compete and make the choice harder.
- **single-featured-section** (warning): Feature at most one section per screen. Emphasis only works by contrast. When several sections are featured, none of them stands out.
- **single-heading** (error): Give each section at most one heading. A heading names its section. Split the section if it needs a second heading; heading levels come from nesting.
- **heading-first** (warning): Put a section's heading before its other content. People and screen readers use headings to understand a region before reading it.
- **form-needs-heading** (warning): Give every top-level section that contains fields a heading. A heading tells people what the form is for and gives assistive technology a name for the region.
- **max-section-depth** (error): Nest sections at most 3 levels deep. Deep nesting is hard to follow and pushes derived heading levels past what people can distinguish.
- **navigate-needs-target** (error): Give every navigate action a target. A navigation action without a destination cannot be rendered as a working link.
- **target-requires-navigate** (warning): Use target only on navigate actions. Only navigation has a destination; on other intents the target is ignored.
- **delete-not-primary** (warning): Do not make delete actions primary. Destructive actions should take a deliberate choice, not be the most inviting option on screen.
- **submit-needs-field** (warning): Place submit actions in a section that has fields. A submit action sends the values of the fields around it. Without fields there is nothing to send.
- **concise-action-label** (warning): Keep action labels to 5 words or fewer. Short labels are faster to scan and fit on small screens.
