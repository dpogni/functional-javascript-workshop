import { renderHook, act } from '@testing-library/react';
import useToggle from '@ex/10-use-toggle/useToggle.js';

describe('10 · Your first custom hook: useToggle', () => {
  test('starts false by default, or at `initial`', () => {
    expect(renderHook(() => useToggle()).result.current.on).toBe(false);
    expect(renderHook(() => useToggle(true)).result.current.on).toBe(true);
  });

  test('toggle flips the value', () => {
    const { result } = renderHook(() => useToggle());
    act(() => result.current.toggle());
    expect(result.current.on).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.on).toBe(false);
  });

  test('setOn and setOff force the value', () => {
    const { result } = renderHook(() => useToggle());
    act(() => result.current.setOn());
    expect(result.current.on).toBe(true);
    act(() => result.current.setOn());
    expect(result.current.on).toBe(true);
    act(() => result.current.setOff());
    expect(result.current.on).toBe(false);
    act(() => result.current.setOff());
    expect(result.current.on).toBe(false);
  });

  test('two toggles in one batch cancel out (functional updates)', () => {
    const { result } = renderHook(() => useToggle());
    act(() => {
      result.current.toggle();
      result.current.toggle();
    });
    expect(result.current.on).toBe(false);
    act(() => {
      result.current.toggle();
      result.current.toggle();
      result.current.toggle();
    });
    expect(result.current.on).toBe(true);
  });

  test('toggle / setOn / setOff keep the same identity across renders', () => {
    const { result, rerender } = renderHook(() => useToggle());
    const first = { ...result.current };
    act(() => result.current.toggle());
    rerender();
    expect(result.current.toggle).toBe(first.toggle);
    expect(result.current.setOn).toBe(first.setOn);
    expect(result.current.setOff).toBe(first.setOff);
  });

  test('an old `toggle` reference still works after re-renders', () => {
    const { result } = renderHook(() => useToggle());
    const { toggle } = result.current;
    act(() => toggle());
    act(() => toggle());
    act(() => toggle());
    expect(result.current.on).toBe(true);
  });

  test('each use of the hook has independent state', () => {
    const a = renderHook(() => useToggle());
    const b = renderHook(() => useToggle());
    act(() => a.result.current.toggle());
    expect(a.result.current.on).toBe(true);
    expect(b.result.current.on).toBe(false);
  });
});
