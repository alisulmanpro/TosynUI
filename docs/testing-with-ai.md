# Testing Tosyn with AI models

This guide is a repeatable way to answer one question: **do AI models produce better interfaces
with Tosyn than without it?** It takes about an hour and needs no code.

## 1. Start the playground

```text
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

Open http://localhost:5173. Pick an example and theme to see how markup becomes a screen. Every
error and warning shows its line; click the line number to jump to it.

## 2. Give a model the guide

1. Click **Copy AI guide** in the playground (or open [`docs/ai/tosyn-guide.md`](ai/tosyn-guide.md)).
2. Start a **new** chat in each model you want to compare (for example Claude, Gemini and
   ChatGPT) and paste the guide as the first message, followed by: _"Reply OK when ready."_
3. Send the prompts below one at a time, in the same chat.

## 3. Prompts

Use the same prompts with every model so the results are comparable.

1. A login screen for a pharmacy staff portal.
2. A solar inverter wire size calculator: inputs for power in watts, system voltage, cable length
   in metres; show the recommended wire size.
3. A checkout form for an online shop with delivery address and phone number.
4. A contact page with a message form and a success message.
5. An account screen where people can change their password or delete their account.

## 4. Check each answer

Paste the model's markup into the playground and record:

| Measure                   | How to read it                                                             |
| ------------------------- | -------------------------------------------------------------------------- |
| Valid first time          | Status says "Valid" without any edits.                                     |
| Errors / warnings         | Counts shown above the findings list.                                      |
| Fixed in one round        | Paste the findings back to the model; is its next answer valid?            |
| Looks right (1–5)         | Your judgement of the preview: hierarchy, spacing, clarity.                |
| Consistent across screens | Do screens 1–5 look like one product? (They should; the renderer decides.) |

To check many files at once, save each answer as a `.tosyn` file and run:

```text
node packages/cli/dist/bin.js check answers/*.tosyn
```

## 5. Compare with the usual approach

For one or two prompts, start a fresh chat **without** the guide and ask for the same screen as
"HTML with Tailwind CSS". Compare:

- **Length:** characters in the Tailwind answer versus the Tosyn answer.
- **Consistency:** do the Tailwind screens use the same colours, spacing and button styles?
- **Readability:** which source would you rather edit by hand?

## 6. What to expect today

Tosyn 0.1 has seven elements. Models will sometimes reach for things it does not have yet, such as
dropdowns, checkboxes, images, lists, tables or navigation menus. Those attempts are reported as
`unknown-element` or `unknown-attribute`. **Write them down**: they are the best evidence for what
the language should add next.

## Score sheet

| Prompt | Model | Valid first time | Errors | Warnings | Fixed in one round | Looks right (1–5) | Missing features |
| ------ | ----- | ---------------- | ------ | -------- | ------------------ | ----------------- | ---------------- |
| 1      |       |                  |        |          |                    |                   |                  |
| 2      |       |                  |        |          |                    |                   |                  |
| 3      |       |                  |        |          |                    |                   |                  |
| 4      |       |                  |        |          |                    |                   |                  |
| 5      |       |                  |        |          |                    |                   |                  |
