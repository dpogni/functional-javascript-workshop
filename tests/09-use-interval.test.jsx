import { renderHook } from '@testing-library/react';
import useInterval from '@ex/09-use-interval/useInterval.js';
import { useFakeTimers, advance, pendingTimers } from './helpers.js';

beforeEach(() => useFakeTimers());

const setup = (callback, delay) =>
  renderHook(({ callback, delay }) => useInterval(callback, delay), {
    initialProps: { callback, delay },
  });

describe('09 · useInterval with pause', () => {
  test('calls the callback every `delay` ms', () => {
    const cb = vi.fn();
    setup(cb, 1000);
    expect(cb).not.toHaveBeenCalled();
    advance(999);
    expect(cb).not.toHaveBeenCalled();
    advance(1);
    expect(cb).toHaveBeenCalledTimes(1);
    advance(3000);
    expect(cb).toHaveBeenCalledTimes(4);
  });

  test('delay = null means paused: no timer at all', () => {
    const cb = vi.fn();
    setup(cb, null);
    expect(pendingTimers()).toBe(0);
    advance(10_000);
    expect(cb).not.toHaveBeenCalled();
  });

  test('pausing and resuming', () => {
    const cb = vi.fn();
    const { rerender } = setup(cb, 100);
    advance(250);
    expect(cb).toHaveBeenCalledTimes(2);
    rerender({ callback: cb, delay: null });
    expect(pendingTimers()).toBe(0);
    advance(1000);
    expect(cb).toHaveBeenCalledTimes(2);
    rerender({ callback: cb, delay: 100 });
    advance(100);
    expect(cb).toHaveBeenCalledTimes(3);
  });

  test('always calls the latest callback (no stale callback)', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = setup(first, 1000);
    advance(1000);
    rerender({ callback: second, delay: 1000 });
    advance(1000);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  test('a new callback does NOT restart the timer', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = setup(first, 1000);
    advance(600);
    rerender({ callback: second, delay: 1000 });
    advance(400); // t = 1000ms: the original schedule must still hold
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  test('a fresh inline callback on every render still ticks on schedule', () => {
    let calls = 0;
    const { rerender } = renderHook(({ n }) => useInterval(() => (calls += n), 1000), {
      initialProps: { n: 1 },
    });
    for (let i = 0; i < 9; i++) {
      advance(100);
      rerender({ n: 1 });
    }
    advance(100);
    expect(calls).toBe(1);
  });

  test('changing delay restarts with the new delay', () => {
    const cb = vi.fn();
    const { rerender } = setup(cb, 1000);
    advance(500);
    rerender({ callback: cb, delay: 200 });
    advance(200);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(pendingTimers()).toBe(1);
  });

  test('clears its timer on unmount', () => {
    const cb = vi.fn();
    const { unmount } = setup(cb, 100);
    advance(150);
    unmount();
    expect(pendingTimers()).toBe(0);
    advance(1000);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
