import { catalog } from '@tosynui/spec';
import { playgroundUrl } from './site';

/**
 * Every piece of copy on the website that Tosyn can write today, as Tosyn markup.
 *
 * Pages render these with `TosynBlock`. A test checks each one with the Tosyn checker, so a block
 * with an error or a warning fails the tests and the build.
 */

/** Builds a one-screen document from the sections inside it. */
const screen = (name: string, purpose: string, body: string): string =>
  `<screen name="${name}" purpose="${purpose}">\n${body}\n</screen>`;

const titled = (name: string, heading: string, text?: string): string =>
  screen(
    name,
    `Show the section titled ${heading}`,
    `  <section name="${name}">\n    <heading>${heading}</heading>${
      text ? `\n    <text>${text}</text>` : ''
    }\n  </section>`,
  );

/** The BMI calculator, shown rendered on the home page next to its own markup. */
export const bmiDemo = screen(
  'bmi-calculator',
  'Work out BMI.',
  `  <section name="inputs" emphasis="featured">
    <heading>BMI calculator</heading>
    <text>Enter your height and weight to see your BMI.</text>
    <field name="height" label="Height" kind="number" unit="cm" required />
    <field name="weight" label="Weight" kind="number" unit="kg" required />
    <action intent="submit" importance="primary">Calculate BMI</action>
  </section>
  <section name="result">
    <result name="bmi" label="Your BMI" />
  </section>`,
);

/** The sign-in screen used as the worked example in the docs. */
export const signInExample = screen(
  'sign-in',
  'Let people sign in.',
  `  <section name="form">
    <heading>Sign in</heading>
    <field name="email" label="Email" kind="email" required />
    <field name="password" label="Password" kind="password" required />
    <action intent="submit" importance="primary">Sign in</action>
    <feedback tone="error" when="after-submit">Wrong email or password.</feedback>
  </section>`,
);

export const home = {
  hero: screen(
    'home-hero',
    'Introduce Tosyn and send people to the playground or the reference.',
    `  <section name="hero">
    <heading>Describe what a screen does. Let rules make it look right.</heading>
    <text>Write what each part is for, and Tosyn checks it and renders it for the web and for React Native. People and AI models write the same short markup.</text>
    <action intent="navigate" importance="primary" target="${playgroundUrl}">Open the playground</action>
    <action intent="navigate" importance="secondary" target="/docs">Read the reference</action>
  </section>`,
  ),
  worksWith: screen(
    'home-works-with',
    'Say which tools Tosyn works with.',
    `  <section name="works-with">
    <text tone="muted">Works with Claude Code, Claude Desktop, Cursor and any MCP client</text>
  </section>`,
  ),
  stepsTitle: titled('home-steps', 'Three steps, and no CSS in any of them.'),
  steps: [
    titled(
      'step-write',
      'Write intent',
      'Name each part of a screen by its purpose and importance. No colours, sizes or CSS.',
    ),
    titled(
      'step-check',
      'Check the rules',
      'The checker and 13 design rules report each problem with its line and how to fix it.',
    ),
    titled(
      'step-render',
      'Render anywhere',
      'The same document becomes an accessible HTML page or a React Native screen, in any brand.',
    ),
  ],
  ai: screen(
    'home-ai',
    'Tell people Tosyn is made for AI models.',
    `  <section name="ai">
    <heading>Made for AI models</heading>
    <text>Give a model the writing guide and it writes valid screens. Check and render over HTTP, or add the MCP server to your tools.</text>
    <action intent="navigate" importance="primary" target="/tosyn-guide.md">Open the writing guide</action>
  </section>`,
  ),
  cta: screen(
    'home-cta',
    'Send people to the playground.',
    `  <section name="cta">
    <heading>Try it in your browser.</heading>
    <text>Write a screen, watch the rules check it, and share the link. Nothing to install.</text>
    <action intent="navigate" importance="primary" target="${playgroundUrl}">Open the playground</action>
    <action intent="navigate" importance="secondary" target="/changelog">Read the changelog</action>
  </section>`,
  ),
};

export const docs = {
  intro: titled(
    'docs-intro',
    'Language reference',
    `Everything in Tosyn ${catalog.specVersion}: the eight elements, the design rules that check them, and the brands that style them.`,
  ),
  elements: titled(
    'docs-elements',
    'The eight elements',
    'Every screen is built from these. Each names a purpose, never an appearance.',
  ),
  details: titled(
    'docs-details',
    'Element details',
    'The content each element can hold, and every attribute with its values and default.',
  ),
  example: titled(
    'docs-example',
    'A complete screen',
    'This sign-in screen uses six of the eight elements. The renderer picks type, spacing and colour from the brand tokens.',
  ),
  rules: titled(
    'docs-rules',
    'Design rules',
    'Rules run after validation. Errors make a screen invalid; warnings are reported but allowed.',
  ),
  brands: titled(
    'docs-brands',
    'Tokens and brands',
    'Brands are tokens files with a light and a dark mode. Contrast is tested for each one.',
  ),
};

export const forAi = {
  hero: screen(
    'for-ai-hero',
    'Explain how AI models use Tosyn.',
    `  <section name="hero">
    <heading>Give a model the guide. Get valid screens back.</heading>
    <text>Tosyn is small enough for a model to learn from one page. It ships a writing guide, a check and render API, and an MCP server.</text>
    <action intent="navigate" importance="primary" target="/tosyn-guide.md">Open the writing guide</action>
    <action intent="navigate" importance="secondary" target="/llms.txt">Read llms.txt</action>
  </section>`,
  ),
  steps: [
    titled(
      'ai-step-guide',
      'Give the guide',
      'Paste the writing guide into the prompt, or a project file. It lists every element, attribute and rule.',
    ),
    titled(
      'ai-step-check',
      'Check the markup',
      'Send what the model wrote to the check API or the MCP tool. Each problem comes back with its line and a fix.',
    ),
    titled(
      'ai-step-render',
      'Render it',
      'Send valid markup to render and get an accessible HTML page, in light or dark and in any brand.',
    ),
  ],
  cards: {
    guide: titled(
      'card-guide',
      'Writing guide',
      'One plain-text page: every element, attribute and rule. It is built from the same catalog the checker uses, so it never drifts.',
    ),
    llms: titled(
      'card-llms',
      'llms.txt',
      'The standard entry point for AI tools. It points to the guide and the API.',
    ),
    api: titled('card-api', 'HTTP API', 'Check and render over HTTP. No account, no install.'),
    mcp: titled(
      'card-mcp',
      'MCP server',
      'Add it to Claude Code, Claude Desktop, Cursor or any MCP client. The model gets check and render tools.',
    ),
  },
  apiSection: titled(
    'for-ai-api',
    'HTTP API reference',
    'Check and render Tosyn from any tool that can send a request. Both endpoints take JSON, are open to any website, and need no account.',
  ),
  cta: screen(
    'for-ai-cta',
    'Send people to the playground.',
    `  <section name="cta">
    <heading>See it in the playground</heading>
    <text>Paste what a model wrote, see the rules check it, and share the link.</text>
    <action intent="navigate" importance="primary" target="${playgroundUrl}">Open the playground</action>
  </section>`,
  ),
};

export const changelogIntro = titled(
  'changelog-intro',
  'Changelog',
  'What changed in each release, newest first.',
);

/** Every block above, flat, so one test can check them all. */
export function allBlocks(): string[] {
  return [
    bmiDemo,
    signInExample,
    home.hero,
    home.worksWith,
    home.stepsTitle,
    ...home.steps,
    home.ai,
    home.cta,
    ...Object.values(docs),
    forAi.hero,
    ...forAi.steps,
    ...Object.values(forAi.cards),
    forAi.apiSection,
    forAi.cta,
    changelogIntro,
  ];
}
