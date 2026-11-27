import { catalog } from '@tosynui/spec';
import { BmiDemo } from './components/BmiDemo';
import { CodeBlock } from './components/CodeBlock';
import { TosynBlock } from './components/TosynBlock';
import { bmiDemo, home } from './content';
import { CURL_SHORT, MCP_COMMAND } from './examples';
import { elementsUsed, plain, tosyn } from './marks';
import { renderBlock } from './tosyn-block';

export default function HomePage() {
  return (
    <div className="container">
      <section className="hero" aria-label="Introduction">
        {/* TOSYN-TODO(module: badge): plain TS for now. Replace with a Tosyn badge element. */}
        <p className="eyebrow" {...plain('badge', 'Badge')}>
          Intent language · v{catalog.specVersion}
        </p>
        <TosynBlock markup={home.hero} idPrefix="hero-" headingLevel={1} className="blk-hero" />
      </section>

      <section className="demo" aria-label="Example">
        {/* TOSYN-TODO(module: window frame): plain TS for now. Replace with a Tosyn frame element. */}
        <div className="window-mark" {...plain('window frame', 'Demo window with code pane')}>
          <div className="window">
            <div className="window-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>bmi-calculator.tosyn</span>
            </div>
            <div className="window-body">
              <CodeBlock source={bmiDemo} language="markup" label="BMI calculator in Tosyn" />
              <div className="window-preview">
                <BmiDemo
                  html={renderBlock(bmiDemo, { idPrefix: 'bmi-', headingLevel: 2 })}
                  mark={tosyn(elementsUsed(bmiDemo))}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="works">
        <TosynBlock markup={home.worksWith} idPrefix="works-" className="blk-center" />
      </div>

      <section className="section" aria-label="How it works">
        <TosynBlock markup={home.stepsTitle} idPrefix="steps-" className="blk-title" />
        {/* TOSYN-TODO(module: layout): plain TS for now. Replace with a Tosyn layout or grid element. */}
        <div
          className="steps"
          {...plain('layout', 'Three-column layout (the texts in it are Tosyn)')}
        >
          {home.steps.map((markup, index) => (
            <div className="step" key={index}>
              <span className="step-number">0{index + 1}</span>
              <TosynBlock
                markup={markup}
                idPrefix={`step-${index}-`}
                headingLevel={3}
                className="blk-step"
                nested
              />
            </div>
          ))}
        </div>
      </section>

      <section className="section band" aria-label="For AI models">
        <TosynBlock markup={home.ai} idPrefix="ai-" className="blk-band-text" />
        <div className="stack">
          <CodeBlock source={CURL_SHORT} label="Check request" />
          <CodeBlock source={MCP_COMMAND} label="Add the MCP server" />
        </div>
      </section>

      <section className="section cta" aria-label="Try Tosyn">
        <TosynBlock markup={home.cta} idPrefix="cta-" className="blk-cta" />
      </section>
    </div>
  );
}
