import type { Metadata } from 'next';
import { rules } from '@tosynui/rules';
import { catalog } from '@tosynui/spec';
import type { AttributeDefinition } from '@tosynui/spec';
import { brandSwatches } from '../brand-swatches';
import { CodeBlock } from '../components/CodeBlock';
import { InlineText } from '../components/InlineText';
import { TosynBlock } from '../components/TosynBlock';
import { docs, signInExample } from '../content';
import { mcpGuideUrl } from '../nav';
import { playgroundUrl } from '../site';

export const metadata: Metadata = {
  title: 'Language reference',
  description: `Every element, attribute and design rule of the Tosyn ${catalog.specVersion} intent language, generated from @tosynui/spec.`,
  alternates: { canonical: '/docs' },
};

function describeType(attribute: AttributeDefinition): string {
  return attribute.type === 'enum' ? (attribute.values ?? []).join(' | ') : attribute.type;
}

const sideGroups = [
  {
    title: 'Start',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Playground', href: playgroundUrl },
      { label: 'Writing guide', href: '/tosyn-guide.md' },
    ],
  },
  {
    title: 'Language',
    links: [
      { label: 'The eight elements', href: '#elements' },
      { label: 'Element details', href: '#details' },
      { label: 'A complete screen', href: '#example' },
      { label: 'Design rules', href: '#rules' },
      { label: 'Tokens and brands', href: '#brands' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { label: 'HTTP API', href: '/for-ai#http-api' },
      { label: 'MCP server', href: mcpGuideUrl },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
];

const tocLinks = sideGroups[1]!.links;

export default function DocsPage() {
  const elements = Object.entries(catalog.elements);
  const swatches = brandSwatches();

  return (
    <div className="container docs-layout">
      {/* TOSYN-TODO(module: navigation): plain TS for now. Replace with the Tosyn navigation and search elements. */}
      <nav className="docs-side" aria-label="Docs">
        {sideGroups.map((group) => (
          <div className="side-group" key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="docs-main">
        <div>
          <p className="crumb">
            <a href="/">Tosyn</a> / Language reference
          </p>
          <TosynBlock
            markup={docs.intro}
            idPrefix="docs-intro-"
            headingLevel={1}
            className="blk-page-title"
          />
        </div>

        <section id="elements" className="doc-section" aria-label="The eight elements">
          <TosynBlock markup={docs.elements} idPrefix="elements-" className="blk-section" />
          {/* TOSYN-TODO(module: table): plain TS for now. Replace with the Tosyn table element. */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Element</th>
                  <th scope="col">Purpose</th>
                  <th scope="col">Attributes</th>
                </tr>
              </thead>
              <tbody>
                {elements.map(([name, element]) => (
                  <tr key={name}>
                    <th scope="row">
                      <code>&lt;{name}&gt;</code>
                    </th>
                    <td>
                      <InlineText>{element.summary}</InlineText>
                    </td>
                    <td>
                      {Object.keys(element.attributes).length > 0
                        ? Object.keys(element.attributes).join(', ')
                        : 'none'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="details" className="doc-section" aria-label="Element details">
          <TosynBlock markup={docs.details} idPrefix="details-" className="blk-section" />
          <div className="details">
            {elements.map(([name, element]) => {
              const attributes = Object.entries(element.attributes);
              return (
                <details key={name} id={name}>
                  <summary>
                    <code>&lt;{name}&gt;</code>
                    <span>
                      <InlineText>{element.summary}</InlineText>
                    </span>
                  </summary>
                  <div className="details-body">
                    <p>
                      <InlineText>{element.guidance}</InlineText>
                    </p>
                    <p>
                      <strong>Content:</strong>{' '}
                      {element.content === 'elements'
                        ? element.children.map((child) => `<${child}>`).join(', ')
                        : element.content}
                    </p>
                    {attributes.length > 0 && (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th scope="col">Attribute</th>
                              <th scope="col">Values</th>
                              <th scope="col">Default</th>
                              <th scope="col">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attributes.map(([attributeName, attribute]) => (
                              <tr key={attributeName}>
                                <th scope="row">
                                  <code>{attributeName}</code>
                                  {attribute.required ? ' (required)' : ''}
                                </th>
                                <td>{describeType(attribute)}</td>
                                <td>
                                  {attribute.default === undefined
                                    ? '—'
                                    : String(attribute.default)}
                                </td>
                                <td>
                                  <InlineText>{attribute.description}</InlineText>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        <section id="example" className="doc-section" aria-label="A complete screen">
          <TosynBlock markup={docs.example} idPrefix="example-" className="blk-section" />
          <CodeBlock source={signInExample} language="markup" label="Sign-in screen in Tosyn" />
        </section>

        <section id="rules" className="doc-section" aria-label="Design rules">
          <TosynBlock markup={docs.rules} idPrefix="rules-" className="blk-section" />
          {/* TOSYN-TODO(module: table): plain TS for now. Replace with the Tosyn table element. */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Rule</th>
                  <th scope="col">Level</th>
                  <th scope="col">What it asks</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <th scope="row">
                      <code>{rule.id}</code>
                    </th>
                    <td>
                      <span className="level" data-level={rule.severity}>
                        {rule.severity === 'error' ? 'Error' : 'Warning'}
                      </span>
                    </td>
                    <td>
                      {rule.summary}
                      <span className="note">{rule.rationale}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="brands" className="doc-section" aria-label="Tokens and brands">
          <TosynBlock markup={docs.brands} idPrefix="brands-" className="blk-section" />
          {/* TOSYN-TODO(module: swatch): plain TS for now. Replace with a Tosyn swatch or token preview element. */}
          <div className="swatches">
            {swatches.map((swatch) => (
              <div className="swatch" key={swatch.id}>
                <i style={{ background: swatch.accent }} />
                <div>
                  <strong>{swatch.label}</strong>
                  <span>In the library · {swatch.accent}</span>
                </div>
              </div>
            ))}
            <div className="swatch">
              <i style={{ background: '#7c3aed' }} />
              <div>
                <strong>Violet</strong>
                <span>The Tosyn brand · to be added</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <nav className="docs-toc" aria-label="On this page">
        <h2>On this page</h2>
        <ul>
          {tocLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
