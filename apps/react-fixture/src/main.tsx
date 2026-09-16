import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@tosynui/core/styles.css';
import './app.css';

function App() {
  return (
    <main data-tosyn className="setup-demo-shell" aria-labelledby="fixture-title">
      <p className="eyebrow">React integration fixture</p>
      <h1 id="fixture-title">React can consume the same standalone CSS.</h1>
      <p>This fixture contains no TosynUI React component dependency.</p>
      <button className="setup-demo-button" type="button">
        Public CSS import works
      </button>
    </main>
  );
}

const root = document.querySelector('#root');
if (!root) throw new Error('React fixture mount element #root was not found.');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
