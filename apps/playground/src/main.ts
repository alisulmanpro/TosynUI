import { renderGuide } from '@tosynui/ai';
import { attachLocations, parseMarkup } from '@tosynui/parser';
import { brands, renderDocument, renderPage } from '@tosynui/render-html';
import type { Theme } from '@tosynui/render-html';
import { checkDocument } from '@tosynui/rules';
import type { Finding } from '@tosynui/rules';
import type { TosynDocument } from '@tosynui/spec';
import accountSettings from '../../../examples/account-settings.tosyn?raw';
import bmiCalculator from '../../../examples/bmi-calculator.tosyn?raw';
import signIn from '../../../examples/sign-in.tosyn?raw';
import { decodeMarkup, encodeMarkup, isShareHash } from './share';
import { docsUrl } from './site';
import './app.css';

const EXAMPLES: Record<string, string> = {
  'bmi-calculator': bmiCalculator,
  'sign-in': signIn,
  'account-settings': accountSettings,
  blank: '<screen name="new-screen" purpose="Describe what the user does here.">\n  \n</screen>\n',
};

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Playground markup is missing ${selector}.`);
  return element;
}

const source = requireElement<HTMLTextAreaElement>('#source');
const example = requireElement<HTMLSelectElement>('#example');
const theme = requireElement<HTMLSelectElement>('#theme');
const brand = requireElement<HTMLSelectElement>('#brand');
const status = requireElement<HTMLElement>('#status');
const list = requireElement<HTMLOListElement>('#findings');
const preview = requireElement<HTMLIFrameElement>('#preview');
const htmlOutput = requireElement<HTMLElement>('#html-output');
const notice = requireElement<HTMLElement>('#notice');

requireElement<HTMLAnchorElement>('#docs-link').href = docsUrl;

for (const [name, { label }] of Object.entries(brands)) brand.add(new Option(label, name));

/** Page options for the chosen theme and brand. */
function pageOptions(): { theme: Theme; brand?: string } {
  return { theme: theme.value as Theme, ...(brand.value ? { brand: brand.value } : {}) };
}

let current: TosynDocument | undefined;

/** Parses, checks and renders the editor content. Invalid markup keeps the last good preview. */
function update(): void {
  const parsed = parseMarkup(source.value);
  let findings: Finding[] = parsed.diagnostics.map((diagnostic) => ({
    source: 'spec',
    severity: 'error',
    ...diagnostic,
  }));
  let valid = false;

  if (parsed.document && findings.length === 0) {
    const result = checkDocument(parsed.document);
    findings = attachLocations(result.findings, parsed.locations);
    valid = result.valid;
  }

  showFindings(findings, valid);
  if (valid && parsed.document) {
    current = parsed.document;
    preview.srcdoc = renderPage(current, pageOptions());
    htmlOutput.textContent = renderDocument(current, { scope: false })
      .replaceAll('><', '>\n<')
      .trim();
    preview.classList.remove('stale');
  } else {
    preview.classList.add('stale');
  }
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function showFindings(findings: readonly Finding[], valid: boolean): void {
  list.replaceChildren();
  const errors = findings.filter((finding) => finding.severity === 'error').length;
  const warnings = findings.length - errors;
  status.dataset.state = valid ? (warnings ? 'warning' : 'valid') : 'invalid';
  status.textContent = valid
    ? warnings
      ? `Valid, with ${plural(warnings, 'warning')}.`
      : 'Valid. No problems found.'
    : `${plural(errors, 'error')}${warnings ? ` and ${plural(warnings, 'warning')}` : ''}. The preview shows the last valid version.`;

  for (const finding of findings) {
    const item = document.createElement('li');
    item.dataset.severity = finding.severity;
    const location = document.createElement('button');
    location.type = 'button';
    location.className = 'location';
    location.textContent = finding.line ? `${finding.line}:${finding.column ?? 1}` : '—';
    location.setAttribute('aria-label', `Go to line ${finding.line ?? 1}`);
    location.addEventListener('click', () => goToLine(finding.line ?? 1));
    const code = document.createElement('code');
    code.textContent = finding.code;
    const message = document.createElement('span');
    message.textContent = finding.message;
    item.append(location, code, message);
    list.append(item);
  }
}

function goToLine(line: number): void {
  const lines = source.value.split('\n');
  const start = lines.slice(0, line - 1).reduce((total, text) => total + text.length + 1, 0);
  source.focus();
  source.setSelectionRange(start, start + (lines[line - 1]?.length ?? 0));
}

function announce(message: string): void {
  notice.textContent = message;
  window.setTimeout(() => {
    if (notice.textContent === message) notice.textContent = '';
  }, 3000);
}

/** Once the markup changes, the link no longer matches it, so reloading must not restore old markup. */
function clearShareHash(): void {
  if (isShareHash(location.hash))
    history.replaceState(null, '', location.pathname + location.search);
}

function loadExample(name: string): void {
  clearShareHash();
  source.value = EXAMPLES[name] ?? '';
  update();
}

example.addEventListener('change', () => loadExample(example.value));
theme.addEventListener('change', update);
brand.addEventListener('change', update);
source.addEventListener('input', update);

requireElement<HTMLButtonElement>('#copy-guide').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(renderGuide());
    announce('AI guide copied. Paste it into your AI chat, then ask for a screen.');
  } catch {
    announce('Copying is blocked here. Open docs/ai/tosyn-guide.md instead.');
  }
});

/** Shows the markup from a share link. Returns false when the hash has none or is broken. */
async function loadShared(): Promise<boolean> {
  if (!isShareHash(location.hash)) return false;
  const markup = await decodeMarkup(location.hash);
  if (markup === undefined) {
    announce('This share link is broken. Showing an example instead.');
    return false;
  }
  source.value = markup;
  update();
  return true;
}

requireElement<HTMLButtonElement>('#share').addEventListener('click', async () => {
  history.replaceState(
    null,
    '',
    location.pathname + location.search + (await encodeMarkup(source.value)),
  );
  try {
    await navigator.clipboard.writeText(location.href);
    announce('Link copied. Anyone who opens it sees this markup.');
  } catch {
    announce('Copying is blocked here. The link is in the address bar.');
  }
});

source.addEventListener('input', clearShareHash);
window.addEventListener('hashchange', () => void loadShared());

requireElement<HTMLButtonElement>('#download').addEventListener('click', () => {
  if (!current) return;
  const name = String(current.root.attributes?.name ?? 'screen');
  const blob = new Blob([renderPage(current, pageOptions())], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${name}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
});

void loadShared().then((shared) => {
  if (!shared) loadExample(example.value);
});
