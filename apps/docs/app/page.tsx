export default function Page() {
  return (
    <main data-tosyn className="setup-demo-shell" aria-labelledby="docs-title">
      <p className="eyebrow">Documentation workspace</p>
      <h1 id="docs-title">TosynUI setup foundation</h1>
      <p>
        This page demonstrates that the Next.js documentation workspace can consume the core
        stylesheet through its public package export.
      </p>
      <p>
        Begin with <code>packages/core/src</code> for CSS and tokens, and{' '}
        <code>packages/contracts/src</code> for contracts.
      </p>
      <button className="setup-demo-button" type="button">
        Setup demonstration
      </button>
    </main>
  );
}
