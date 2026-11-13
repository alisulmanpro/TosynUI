import { validateDocument } from '@tosynui/spec';
import example from '@tosynui/spec/examples/bmi-calculator.json';
import './app.css';

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Playground markup is missing ${selector}.`);
  return element;
}

const editor = requireElement<HTMLTextAreaElement>('#document');
const status = requireElement<HTMLElement>('#status');
const list = requireElement<HTMLOListElement>('#diagnostics');

function render(): void {
  list.replaceChildren();

  let parsed: unknown;
  try {
    parsed = JSON.parse(editor.value);
  } catch (error) {
    status.dataset.state = 'invalid';
    status.textContent = `Not valid JSON: ${(error as Error).message}`;
    return;
  }

  const { valid, diagnostics } = validateDocument(parsed);
  status.dataset.state = valid ? 'valid' : 'invalid';
  status.textContent = valid
    ? 'Valid Tosyn document.'
    : `${diagnostics.length} problem${diagnostics.length === 1 ? '' : 's'} found.`;

  for (const diagnostic of diagnostics) {
    const item = document.createElement('li');
    const code = document.createElement('code');
    code.textContent = diagnostic.code;
    const path = document.createElement('code');
    path.textContent = diagnostic.path;
    item.append(code, ' ', diagnostic.message, ' ', path);
    list.append(item);
  }
}

editor.value = JSON.stringify(example, null, 2);
editor.addEventListener('input', render);
render();
