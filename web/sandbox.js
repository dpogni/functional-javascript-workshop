// Parent side of the sandbox: spins up a fresh <iframe> for every job so each
// run starts from a clean slate (no leaked timers, state or modules).
const RUNNER_URL = new URL('runner.html', document.baseURI).href;
const RUN_TIMEOUT = 30_000;

export function createSandboxFrame() {
  const frame = document.createElement('iframe');
  frame.src = RUNNER_URL;
  frame.title = 'sandbox';
  return frame;
}

/** Posts `job` to the frame once its runner reports ready. Returns an unsubscribe function. */
export function connect(frame, job, onMessage) {
  const listener = (event) => {
    if (event.source !== frame.contentWindow || event.data?.source !== 'workshop-runner') return;
    if (event.data.type === 'ready') {
      frame.contentWindow.postMessage({ source: 'workshop-app', ...job }, '*');
    } else {
      onMessage?.(event.data);
    }
  };
  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

/**
 * Runs the tests for one exercise against `code`.
 * Resolves with { results } | { compileError } | { timedOut }.
 */
export function runTests({ exercise, file, code }, onTest) {
  return new Promise((resolve) => {
    const frame = createSandboxFrame();
    // Off-screen rather than display:none, so focus and layout behave normally.
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.style.cssText =
      'position:fixed;left:-10000px;top:0;width:1024px;height:768px;border:0;opacity:0;pointer-events:none;';

    // Browsers only fire focus/blur events inside a frame that has focus, and
    // several exercises are graded on focus behaviour. So the sandbox borrows
    // focus for the duration of the run and hands it back afterwards.
    const previouslyFocused = document.activeElement;

    const finish = (outcome) => {
      clearTimeout(timer);
      disconnect();
      frame.remove();
      previouslyFocused?.focus?.({ preventScroll: true });
      resolve(outcome);
    };
    const disconnect = connect(frame, { type: 'test', exercise, file, code }, (message) => {
      if (message.type === 'test') onTest?.(message.result);
      if (message.type === 'done') finish(message);
    });
    const timer = setTimeout(() => finish({ timedOut: true }), RUN_TIMEOUT);
    document.body.append(frame);
  });
}
