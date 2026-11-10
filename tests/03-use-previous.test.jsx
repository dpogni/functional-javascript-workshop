import { renderHook } from '@testing-library/react';
import usePrevious from '@ex/03-use-previous/usePrevious.js';

describe('03 · usePrevious', () => {
  test('returns undefined on the first render', () => {
    const { result } = renderHook(({ v }) => usePrevious(v), { initialProps: { v: 1 } });
    expect(result.current).toBeUndefined();
  });

  test('returns the value from the previous render', () => {
    const { result, rerender } = renderHook(({ v }) => usePrevious(v), {
      initialProps: { v: 1 },
    });
    rerender({ v: 2 });
    expect(result.current).toBe(1);
    rerender({ v: 3 });
    expect(result.current).toBe(2);
    rerender({ v: 10 });
    expect(result.current).toBe(3);
  });

  test('tracks renders, not changes (same value twice → previous is that value)', () => {
    const { result, rerender } = renderHook(({ v }) => usePrevious(v), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    expect(result.current).toBe('a');
    rerender({ v: 'b' });
    expect(result.current).toBe('b');
  });

  test('works with objects (same reference) and null', () => {
    const obj = { x: 1 };
    const { result, rerender } = renderHook(({ v }) => usePrevious(v), {
      initialProps: { v: obj },
    });
    rerender({ v: null });
    expect(result.current).toBe(obj);
    rerender({ v: 0 });
    expect(result.current).toBeNull();
  });

  test('does not cause extra renders', () => {
    let renders = 0;
    const { rerender } = renderHook(
      ({ v }) => {
        renders += 1;
        return usePrevious(v);
      },
      { initialProps: { v: 1 } }
    );
    rerender({ v: 2 });
    rerender({ v: 3 });
    expect(renders).toBe(3);
  });
});
