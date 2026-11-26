/**
 * What changed in each release, newest first.
 *
 * Each line comes from the "Changelog:" line of the pull request that made the change. Add a line
 * here in the same pull request that makes a user-visible change.
 */
export interface ChangelogEntry {
  /** Version number, or a label such as "Next release (0.2.0)" before it is published. */
  readonly version: string;
  readonly changes: readonly string[];
}

export const changelog: readonly ChangelogEntry[] = [
  {
    version: 'Next release (0.2.0)',
    changes: [
      'Language 0.2: added the `result` element (a value the screen works out after submit) and `feedback when="after-submit"`, with two new design rules, `result-needs-submit` and `after-submit-needs-submit`.',
      'Added brand themes (`ocean`, `forest`) from tokens files, and a Brand picker in the playground.',
      'Added a Share button to the playground; the link holds the markup in the URL hash.',
      'Added `@tosynui/render-react-native` and an Expo demo app.',
      'Added a hosted check and render API (`/api/check`, `/api/render`) to the docs site.',
      'Added `/llms.txt` and the AI writing guide at `/tosyn-guide.md` on the docs site.',
      'The MCP server now serves the Tosyn 0.2 language: `result`, timed feedback and the new rules.',
      'Re-ran the AI test with the 0.2 guide; the two gaps found in the first test are closed.',
    ],
  },
];
