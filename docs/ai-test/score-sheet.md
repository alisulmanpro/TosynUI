# AI test score sheet (Week 1)

Filled in by Claude from the answers in [kit.md](kit.md). The measures are explained in
[Testing Tosyn with AI models](../testing-with-ai.md#4-check-each-answer). "Looks right" is judged
from a rendered screenshot of each valid answer.

## Per answer

| Prompt | Model   | Valid first time | Errors | Warnings | Fixed in one round | Looks right (1-5) | Missing features                                      |
| ------ | ------- | ---------------- | ------ | -------- | ------------------ | ----------------- | ----------------------------------------------------- |
| 1      | Claude  | Not tested       |        |          |                    |                   |                                                       |
| 2      | Claude  | Not tested       |        |          |                    |                   |                                                       |
| 3      | Claude  | Not tested       |        |          |                    |                   |                                                       |
| 4      | Claude  | Not tested       |        |          |                    |                   |                                                       |
| 5      | Claude  | Not tested       |        |          |                    |                   |                                                       |
| 1      | Gemini  | Yes              | 0      | 0        | Not needed         | 4                 | None                                                  |
| 2      | Gemini  | Yes              | 0      | 0        | Not needed         | 3                 | Cannot show a calculated result (placeholder text)    |
| 3      | Gemini  | Yes              | 0      | 0        | Not needed         | 4                 | None                                                  |
| 4      | Gemini  | Yes              | 0      | 0        | Not needed         | 3                 | Success message always visible, not only after submit |
| 5      | Gemini  | Yes              | 0      | 0        | Not needed         | 4                 | None                                                  |
| 1      | ChatGPT | Yes              | 0      | 0        | Not needed         | 4                 | None                                                  |
| 2      | ChatGPT | Yes              | 0      | 0        | Not needed         | 3                 | Cannot show a calculated result (placeholder text)    |
| 3      | ChatGPT | Yes              | 0      | 0        | Not needed         | 4                 | None                                                  |
| 4      | ChatGPT | Yes              | 0      | 0        | Not needed         | 3                 | Success message always visible, not only after submit |
| 5      | ChatGPT | Yes              | 0      | 0        | Not needed         | 4                 | None                                                  |

## Per model

| Model   | Valid first time (of 5) | Valid after one round (of 5) | Pass line met (4 of 5 after one round) |
| ------- | ----------------------- | ---------------------------- | -------------------------------------- |
| Claude  | Not tested              | Not tested                   | Not tested                             |
| Gemini  | 5                       | 5                            | Yes                                    |
| ChatGPT | 5                       | 5                            | Yes                                    |

**Gate result:** models that met the pass line, out of 3 (need 2): **2 (ChatGPT, Gemini). Pass line met.** Claude was not tested; it is not needed for the pass line.

Source: Ali's screenshots (`Testing.pdf`, 26 Nov). "Valid. No problems found." in the playground was shown for all 10 answers, so no repair round was needed. "Looks right" is Claude's view from the screenshots.

## Missing features

Elements and attributes that models tried to use and Tosyn does not have, from the
`unknown-element` and `unknown-attribute` findings. Add a line for each, with how many answers used
it.

| Element or attribute                                                            | Answers that used it            | Where it was needed                                                                |
| ------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| Show a calculated result (a value that appears after the user clicks Calculate) | 2 of 10 (prompt 2, both models) | Solar wire size: the "recommended wire size" was written as a placeholder sentence |
| Show a message only after an action (for example after Send)                    | 2 of 10 (prompt 4, both models) | Contact page: the success message is visible before the form is sent               |

No `unknown-element` or `unknown-attribute` findings appeared. The two gaps above are workarounds the models made inside valid markup.

## Tailwind comparison (optional)

| Measure                       | Tosyn                  | Tailwind                                                    |
| ----------------------------- | ---------------------- | ----------------------------------------------------------- |
| Lines in the answer, prompt 1 | About 15 (both models) | 254 (Gemini, with JavaScript); ChatGPT's length not visible |
| Look across models            | Same style in both     | Different style in each                                     |
