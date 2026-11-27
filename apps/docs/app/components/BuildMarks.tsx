'use client';

import { useEffect, useState } from 'react';
import { repoUrl } from '../nav';

const STORAGE_KEY = 'tosyn-build-marks';

/**
 * A button that shows which parts of the page are written in Tosyn and which are plain
 * TypeScript for now, with a small legend. Open any page with `?marks=1` to start with it on.
 *
 * TOSYN-TODO(module: toggle): plain TS for now. Replace with the Tosyn switch element.
 */
export function BuildMarks() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    let start = new URLSearchParams(window.location.search).get('marks') === '1';
    try {
      start = start || window.localStorage.getItem(STORAGE_KEY) === 'on';
    } catch {
      // Storage can be blocked; the button still works for this visit.
    }
    setOn(start);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.marks = on ? 'on' : 'off';
    try {
      window.localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
    } catch {
      // See above.
    }
  }, [on]);

  return (
    <div className="marks-ui">
      {on && (
        <div className="marks-legend" role="note">
          <p>
            <i data-kind="tosyn" aria-hidden="true" /> Written in Tosyn
          </p>
          <p>
            <i data-kind="plain" aria-hidden="true" /> Plain TypeScript for now
          </p>
          <a href={`${repoUrl}/blob/main/apps/docs/design-refs/BUILD-MAP.md`}>
            What the library still needs
          </a>
        </div>
      )}
      <button type="button" aria-pressed={on} onClick={() => setOn((value) => !value)}>
        {on ? 'Hide build marks' : 'Show build marks'}
      </button>
    </div>
  );
}
