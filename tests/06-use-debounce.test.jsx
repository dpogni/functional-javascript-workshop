import { renderHook } from '@testing-library/react';
import useDebounce from '@ex/06-use-debounce/useDebounce.js';
import { useFakeTimers, advance, pendingTimers } from './helpers.js';

beforeEach(() => useFakeTimers());

const setup = (value = 'a', delay = 500) =>
  renderHook(({ value, delay }) => useDebounce(value, delay), {
    initialProps: { value, delay },
  });

describe('06 · useDebounce', () => {
  test('returns the initial value immediately', () => {
    const { result } = setup('hello');
    expect(result.current).toBe('hello');
  });

  test('keeps the old value until the delay has passed', () => {
    const { result, rerender } = setup('a', 500);
    rerender({ value: 'b', delay: 500 });
    expect(result.current).toBe('a');
    advance(499);
    expect(result.current).toBe('a');
    advance(1);
    expect(result.current).toBe('b');
  });

  test('defaults to a 500ms delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 1 },
    });
    rerender({ value: 2 });
    advance(499);
    expect(result.current).toBe(1);
    advance(1);
    expect(result.current).toBe(2);
  });

  test('each change restarts the wait; only the last value wins', () => {
    const { result, rerender } = setup('', 300);
    const seen = new Set();
    for (const v of ['r', 're', 'rea', 'reac', 'react']) {
      rerender({ value: v, delay: 300 });
      advance(200);
      seen.add(result.current);
    }
    expect(result.current).toBe('');
    advance(100);
    expect(result.current).toBe('react');
    expect([...seen]).toEqual(['']);
  });

  test('changing the delay mid-wait restarts with the new delay', () => {
    const { result, rerender } = setup('a', 500);
    rerender({ value: 'b', delay: 500 });
    advance(200);
    rerender({ value: 'b', delay: 1000 });
    advance(999);
    expect(result.current).toBe('a');
    advance(1);
    expect(result.current).toBe('b');
  });

  test('never keeps more than one pending timer', () => {
    const { rerender } = setup(0, 500);
    for (let i = 1; i <= 5; i++) {
      rerender({ value: i, delay: 500 });
      expect(pendingTimers()).toBeLessThanOrEqual(1);
    }
  });

  test('clears its timer on unmount', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender, unmount } = setup('a', 500);
    rerender({ value: 'b', delay: 500 });
    unmount();
    expect(pendingTimers()).toBe(0);
    advance(1000);
    expect(errors).not.toHaveBeenCalled();
  });
});
