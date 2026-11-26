import type { Metadata } from 'next';
import { changelog } from './entries';

export const metadata: Metadata = {
  title: 'Tosyn changelog',
  description: 'What changed in each release of Tosyn.',
  alternates: { canonical: '/changelog' },
};

/** Renders `backtick` spans as inline code. */
function InlineText({ children }: { children: string }) {
  return children
    .split('`')
    .map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part));
}

export default function ChangelogPage() {
  return (
    <main>
      <header>
        <p className="eyebrow">Tosyn intent language</p>
        <h1>Changelog</h1>
        <p>
          What changed in each release. <a href="/">Back to the reference</a>.
        </p>
      </header>

      {changelog.map((entry, index) => (
        // A numbered id: the version text can hold spaces, which aria-labelledby reads as several ids.
        <section key={entry.version} aria-labelledby={`release-${index}`}>
          <h2 id={`release-${index}`}>{entry.version}</h2>
          <ul>
            {entry.changes.map((change) => (
              <li key={change}>
                <InlineText>{change}</InlineText>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
