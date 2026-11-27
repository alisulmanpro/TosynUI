import type { Metadata } from 'next';
import { InlineText } from '../components/InlineText';
import { TosynBlock } from '../components/TosynBlock';
import { changelogIntro } from '../content';
import { plain } from '../marks';
import { changelog } from './entries';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'What changed in each release of Tosyn.',
  alternates: { canonical: '/changelog' },
};

const UNRELEASED = /^Next release/;

export default function ChangelogPage() {
  const latest = changelog.findIndex((entry) => !UNRELEASED.test(entry.version));
  return (
    <div className="container">
      <section className="hero" style={{ textAlign: 'left' }} aria-label="Introduction">
        <p className="crumb" {...plain('navigation', 'Breadcrumb')}>
          <a href="/">Tosyn</a> / Changelog
        </p>
        <TosynBlock
          markup={changelogIntro}
          idPrefix="changelog-"
          headingLevel={1}
          className="blk-page-title"
        />
      </section>

      <section className="section" aria-label="Releases" {...plain('timeline', 'Release list')}>
        {/* TOSYN-TODO(module: timeline): plain TS for now. Replace with a Tosyn list or timeline element. */}
        {changelog.map((entry, index) => (
          // A numbered id: the version text can hold spaces, which aria-labelledby reads as several ids.
          <article key={entry.version} className="release" aria-labelledby={`release-${index}`}>
            <div>
              <h2 id={`release-${index}`}>{entry.version}</h2>
              {index === latest && <span className="release-label">Latest release</span>}
              {UNRELEASED.test(entry.version) && (
                <span className="release-label">Not released yet</span>
              )}
            </div>
            <ul>
              {entry.changes.map((change) => (
                <li key={change}>
                  <span>
                    <InlineText>{change}</InlineText>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}
