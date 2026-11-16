// A small test harness that provides the subset of Vitest's API the workshop
// tests use (describe / test / expect / vi), so the very same test files that
// `npm run check` runs in Node can run inside a browser iframe.
import * as chai from 'chai';
import {
  JestExtend,
  JestChaiExpect,
  JestAsymmetricMatchers,
  ASYMMETRIC_MATCHERS_OBJECT,
  GLOBAL_EXPECT,
  getState,
  setState,
} from '@vitest/expect';
import { fn, spyOn, restoreAllMocks } from '@vitest/spy';
import FakeTimers from '@sinonjs/fake-timers';
import * as domMatchers from '@testing-library/jest-dom/matchers';

// ---- expect ----------------------------------------------------------------
chai.use(JestExtend);
chai.use(JestChaiExpect);
chai.use(JestAsymmetricMatchers);

export const expect = (value, message) => {
  const { assertionCalls } = getState(expect);
  setState({ assertionCalls: assertionCalls + 1 }, expect);
  return chai.expect(value, message);
};
Object.assign(expect, chai.expect);
Object.assign(expect, globalThis[ASYMMETRIC_MATCHERS_OBJECT]);
expect.getState = () => getState(expect);
expect.setState = (state) => setState(state, expect);
setState(
  {
    assertionCalls: 0,
    isExpectingAssertions: false,
    isExpectingAssertionsError: null,
    expectedAssertionsNumber: null,
    expectedAssertionsNumberErrorGen: null,
  },
  expect
);
expect.extend = (matchers) => chai.expect.extend(expect, matchers);
Object.defineProperty(globalThis, GLOBAL_EXPECT, { value: expect, writable: true, configurable: true });
expect.extend(domMatchers);

// ---- vi --------------------------------------------------------------------
let clock = null;

export const vi = {
  fn,
  spyOn,
  restoreAllMocks,
  useFakeTimers(options = {}) {
    clock?.uninstall();
    clock = FakeTimers.install({ now: Date.now(), toFake: options.toFake });
    return vi;
  },
  useRealTimers() {
    clock?.uninstall();
    clock = null;
    return vi;
  },
  advanceTimersByTime(ms) {
    if (!clock) throw new Error('Timers are not mocked. Call vi.useFakeTimers() first.');
    clock.tick(ms);
    return vi;
  },
  getTimerCount() {
    return clock ? clock.countTimers() : 0;
  },
};

// ---- describe / test -------------------------------------------------------
const TEST_TIMEOUT = 5000;
let suites = [];
let tests = [];
const hooks = { beforeEach: [], afterEach: [] };

export function describe(name, body) {
  suites.push(name);
  try {
    body();
  } finally {
    suites.pop();
  }
}

export function test(name, body) {
  tests.push({ suite: suites.join(' › '), name, body });
}
export const it = test;

export function beforeEach(hook) {
  hooks.beforeEach.push(hook);
}
export function afterEach(hook) {
  hooks.afterEach.push(hook);
}

export function installGlobals(target = globalThis) {
  Object.assign(target, { describe, test, it, expect, vi, beforeEach, afterEach });
}

function describeError(err) {
  if (!err) return 'Unknown error';
  let message = String(err.message ?? err);
  // Testing Library appends a dump of the whole DOM; keep the useful first part.
  const cut = message.search(/\n\s*(Ignored nodes:|<body|\u001b\[36m<body)/);
  if (cut > 0) message = message.slice(0, cut);
  // eslint-disable-next-line no-control-regex
  return message.replace(/\u001b\[[0-9;]*m/g, '').trim();
}

const withTimeout = (promise) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      // Use the real timer even when a test has installed fake ones.
      realSetTimeout(() => reject(new Error(`Test timed out after ${TEST_TIMEOUT}ms`)), TEST_TIMEOUT)
    ),
  ]);
const realSetTimeout = globalThis.setTimeout.bind(globalThis);

/**
 * Runs every collected test in order.
 * @param {(result: object) => void} onResult called after each test
 * @param {() => void | Promise<void>} afterEachTest harness-level cleanup
 */
export async function runTests(onResult, afterEachTest) {
  const results = [];
  for (const t of tests) {
    const started = performance.now();
    let error = null;
    try {
      await withTimeout(
        (async () => {
          for (const hook of hooks.beforeEach) await hook();
          await t.body();
        })()
      );
    } catch (err) {
      error = describeError(err);
    }
    try {
      for (const hook of hooks.afterEach) await hook();
      await afterEachTest?.();
    } catch (err) {
      error ??= describeError(err);
    }
    vi.useRealTimers();
    restoreAllMocks();
    const result = {
      suite: t.suite,
      name: t.name,
      pass: error === null,
      error,
      duration: Math.round(performance.now() - started),
    };
    results.push(result);
    onResult?.(result);
  }
  tests = [];
  return results;
}
