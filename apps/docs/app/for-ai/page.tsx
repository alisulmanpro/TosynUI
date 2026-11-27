import type { Metadata } from 'next';
import { CodeBlock } from '../components/CodeBlock';
import { TosynBlock } from '../components/TosynBlock';
import { forAi } from '../content';
import { CURL_EXAMPLE, CURL_SHORT, MCP_COMMAND } from '../examples';
import { mcpGuideUrl } from '../nav';
import { docsUrl } from '../site';

export const metadata: Metadata = {
  title: 'For AI',
  description:
    'The Tosyn writing guide, llms.txt, the HTTP check and render API, and the MCP server: everything an AI model needs to write valid screens.',
  alternates: { canonical: '/for-ai' },
};

const cards = [
  {
    key: 'guide',
    markup: forAi.cards.guide,
    code: `${docsUrl}/tosyn-guide.md`,
    link: { label: 'Open the guide', href: '/tosyn-guide.md' },
  },
  {
    key: 'llms',
    markup: forAi.cards.llms,
    code: `${docsUrl}/llms.txt`,
    link: { label: 'Open llms.txt', href: '/llms.txt' },
  },
  {
    key: 'api',
    markup: forAi.cards.api,
    code: CURL_SHORT,
    link: { label: 'See the endpoints', href: '#http-api' },
  },
  {
    key: 'mcp',
    markup: forAi.cards.mcp,
    code: MCP_COMMAND,
    link: { label: 'Read the MCP guide', href: mcpGuideUrl },
  },
] as const;

export default function ForAiPage() {
  return (
    <div className="container">
      <section className="hero" aria-label="Introduction">
        {/* TOSYN-TODO(module: badge): plain TS for now. Replace with a Tosyn badge element. */}
        <p className="eyebrow">For AI models and the people who use them</p>
        <TosynBlock markup={forAi.hero} idPrefix="hero-" headingLevel={1} className="blk-hero" />
      </section>

      <section className="section" aria-label="How a model uses Tosyn">
        {/* TOSYN-TODO(module: layout): plain TS for now. Replace with a Tosyn layout or grid element. */}
        <div className="steps">
          {forAi.steps.map((markup, index) => (
            <div className="step" key={index}>
              <span className="step-number">0{index + 1}</span>
              <TosynBlock
                markup={markup}
                idPrefix={`step-${index}-`}
                headingLevel={2}
                className="blk-step"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-label="Tools for AI">
        {/* TOSYN-TODO(module: layout): plain TS for now. Replace with a Tosyn layout or grid element. */}
        <div className="cards">
          {cards.map((card) => (
            <div className="card" key={card.key}>
              <TosynBlock
                markup={card.markup}
                idPrefix={`card-${card.key}-`}
                headingLevel={2}
                className="blk-card"
              />
              <CodeBlock source={card.code} label={`${card.link.label}: example`} />
              <a className="card-link" href={card.link.href}>
                {card.link.label} →
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="http-api" className="section doc-section" aria-label="HTTP API reference">
        <TosynBlock markup={forAi.apiSection} idPrefix="api-" className="blk-section" />
        {/* TOSYN-TODO(module: table): plain TS for now. Replace with the Tosyn table element. */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Endpoint</th>
                <th scope="col">Send</th>
                <th scope="col">Answer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  <code>POST /api/check</code>
                </th>
                <td>
                  <code>markup</code>
                </td>
                <td>
                  200 with <code>valid</code>, error and warning counts and every finding with its
                  line, column and how to fix it. Invalid markup is a normal answer.
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <code>POST /api/render</code>
                </th>
                <td>
                  <code>markup</code>, and optionally <code>theme</code> (light, dark, system) and{' '}
                  <code>brand</code> (ocean, forest)
                </td>
                <td>
                  200 with a complete HTML page in <code>html</code>. Markup with errors is not
                  rendered: 422 with the findings.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <CodeBlock source={CURL_EXAMPLE} label="A check request that works as written" />
        <p className="release-next-note">
          Markup is limited to 50,000 characters. Wrong requests get 400 or 413 with an{' '}
          <code>error</code> message that says what to change.
        </p>
      </section>

      <section className="section cta-band cta" aria-label="Try Tosyn">
        <TosynBlock markup={forAi.cta} idPrefix="cta-" className="blk-cta" />
      </section>
    </div>
  );
}
