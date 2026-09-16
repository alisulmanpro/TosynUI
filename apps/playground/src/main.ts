import '@tosynui/core/styles.css';
import './app.css';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Playground mount element #app was not found.');

app.innerHTML = `
  <section data-tosyn class="setup-demo-shell" aria-labelledby="playground-title">
    <p class="eyebrow">Setup demonstration</p>
    <h1 id="playground-title">Plain HTML can consume TosynUI CSS.</h1>
    <p>The stylesheet is imported from the core package public export.</p>
    <button class="setup-demo-button" type="button">Public CSS import works</button>
  </section>
`;
