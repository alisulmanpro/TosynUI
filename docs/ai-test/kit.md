# AI test kit (Week 1)

This kit answers one question: **do AI models write valid, good-looking screens with Tosyn?** It
takes about an hour. The longer background is in [Testing Tosyn with AI models](../testing-with-ai.md).

You need three chats: **Claude**, **Gemini** and **ChatGPT**. Use the same steps in each one.

## Steps

1. Open the live playground at https://play-tosynui.vercel.app and click **Copy AI guide**.
2. Start a **new** chat in the model. Paste the guide, then add this line under it:
   `Reply OK when ready.`
3. Send the five prompts below, **one at a time, in the same chat**.
4. For each answer, copy **only the markup**: from `<screen` to `</screen>`. Do not copy the
   ` ```html ` fence lines or any sentence before or after it. The checker counts them as errors.
5. Send the answers to Claude (format below). Claude checks them and, for any that are not valid,
   sends back the findings.
6. Paste those findings into the **same chat** and send the corrected answers to Claude the same
   way, with `Round: 2`. This is the "fixed in one round" test: one repair round only.

## The five prompts

Copy each one exactly. Use the same text in every model.

```text
A login screen for a pharmacy staff portal.
```

```text
A solar inverter wire size calculator: inputs for power in watts, system voltage, cable length in metres; show the recommended wire size.
```

```text
A checkout form for an online shop with delivery address and phone number.
```

```text
A contact page with a message form and a success message.
```

```text
An account screen where people can change their password or delete their account.
```

## What to send to Claude

One message per model and round, in this shape. Paste the markup as plain text under each heading.

```text
Model: Gemini (write the exact model name from the app)
Round: 1

## Prompt 1
<screen ...>
...
</screen>

## Prompt 2
...
```

If a model refuses, writes something that is not Tosyn, or does not answer, write that under the
prompt instead of markup.

## Pass line

Tosyn passes the Week 1 gate if **at least 2 of the 3 models** give valid markup for **at least 4
of the 5 prompts after one repair round**. If it does not pass, Week 2 starts with fixing the guide
and the rules, and no new elements are added.

## Optional: compare with Tailwind (Claude only, prompt 1)

Start a new Claude chat **without** the guide and send:

```text
A login screen for a pharmacy staff portal. Reply with HTML and Tailwind CSS.
```

Send the answer to Claude with the heading `## Tailwind prompt 1`. Claude compares the length with
the Tosyn answer.

## Score sheet

Claude fills in [score-sheet.md](score-sheet.md) from your answers.
