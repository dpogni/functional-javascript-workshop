// Runs inside a throw-away <iframe>. The app posts it a job (run the tests, or
// render a live preview) together with the code from the editor.
import { createElement, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { cleanup } from '@testing-library/react';
import { compile, CompileError } from './compile.js';
import { registerUserModule } from './registry.js';
import { installGlobals, runTests } from './harness.js';
import { demos } from '../demos.jsx';

const testFiles = import.meta.glob('../../tests/*.test.jsx');
const post = (message) => window.parent.postMessage({ source: 'workshop-runner', ...message }, '*');

async function runTestJob({ exercise, file, code }) {
  let exports;
  try {
    exports = compile(exercise, file, code);
  } catch (err) {
    post({ type: 'done', compileError: formatError(err) });
    return;
  }
  registerUserModule(`${exercise}/${file}`, exports);
  // Focus/blur events only fire in a focused frame (see sandbox.js).
  window.focus();
  installGlobals();
  try {
    await testFiles[`../../tests/${exercise}.test.jsx`]();
  } catch (err) {
    post({ type: 'done', compileError: formatError(err) });
    return;
  }
  const results = await runTests((result) => post({ type: 'test', result }), () => cleanup());
  post({ type: 'done', results });
}

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return createElement('pre', { className: 'sandbox-error' }, formatError(this.state.error));
    }
    return this.props.children;
  }
}

function runPreviewJob({ exercise, file, code }) {
  const rootEl = document.getElementById('root');
  try {
    const exports = compile(exercise, file, code);
    const Demo = demos[exercise];
    createRoot(rootEl).render(
      createElement(ErrorBoundary, null, createElement(Demo, { mod: exports }))
    );
  } catch (err) {
    rootEl.innerHTML = '';
    const pre = document.createElement('pre');
    pre.className = 'sandbox-error';
    pre.textContent = formatError(err);
    rootEl.append(pre);
  }
}

function formatError(err) {
  const kind = err instanceof CompileError || err instanceof SyntaxError ? 'Syntax error' : err?.name ?? 'Error';
  return `${kind}: ${err?.message ?? err}`;
}

window.addEventListener('message', (event) => {
  const job = event.data;
  if (job?.source !== 'workshop-app') return;
  if (job.type === 'test') runTestJob(job);
  if (job.type === 'preview') runPreviewJob(job);
});

post({ type: 'ready' });
