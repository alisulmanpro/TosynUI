import { rules } from '@tosynui/rules';
import { catalog } from '@tosynui/spec';
import type { AttributeDefinition } from '@tosynui/spec';

/** Renders `backtick` spans from catalog text as inline code. */
function InlineText({ children }: { children: string }) {
  return children
    .split('`')
    .map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part));
}

function describeType(attribute: AttributeDefinition): string {
  return attribute.type === 'enum' ? (attribute.values ?? []).join(' | ') : attribute.type;
}

export default function Page() {
  const elements = Object.entries(catalog.elements);

  return (
    <main>
      <header>
        <p className="eyebrow">Tosyn intent language · v{catalog.specVersion}</p>
        <h1>Describe what an interface does, not how it looks.</h1>
        <p>
          A Tosyn document names each part of a screen by its purpose and importance. Design rules
          and renderers decide the visual result, so people and AI models write the same short,
          readable markup and every screen stays consistent.
        </p>
        <p>
          This reference is generated from <code>@tosynui/spec</code>, the same catalog the
          validator uses. A document starts with <code>&lt;{catalog.root}&gt;</code>.
        </p>
      </header>

      <nav aria-label="Elements">
        <ul>
          {elements.map(([name]) => (
            <li key={name}>
              <a href={`#${name}`}>
                <code>{name}</code>
              </a>
            </li>
          ))}
          <li>
            <a href="#design-rules">Design rules</a>
          </li>
        </ul>
      </nav>

      {elements.map(([name, element]) => {
        const attributes = Object.entries(element.attributes);
        return (
          <section key={name} id={name} aria-labelledby={`${name}-title`}>
            <h2 id={`${name}-title`}>
              <code>&lt;{name}&gt;</code>
            </h2>
            <p>
              <InlineText>{element.summary}</InlineText>
            </p>
            <p className="guidance">
              <InlineText>{element.guidance}</InlineText>
            </p>
            <p>
              <strong>Content:</strong>{' '}
              {element.content === 'elements'
                ? element.children.map((child) => `<${child}>`).join(', ')
                : element.content}
            </p>
            {attributes.length > 0 && (
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
                      <td>{attribute.default === undefined ? '—' : String(attribute.default)}</td>
                      <td>
                        <InlineText>{attribute.description}</InlineText>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        );
      })}
      <section id="design-rules" aria-labelledby="design-rules-title">
        <h2 id="design-rules-title">Design rules</h2>
        <p>
          Rules run after validation. Errors make a screen invalid; warnings are reported but
          allowed.
        </p>
        <table>
          <thead>
            <tr>
              <th scope="col">Rule</th>
              <th scope="col">Severity</th>
              <th scope="col">Summary</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id}>
                <th scope="row">
                  <code>{rule.id}</code>
                </th>
                <td>{rule.severity}</td>
                <td>
                  {rule.summary} <span className="guidance-inline">{rule.rationale}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
