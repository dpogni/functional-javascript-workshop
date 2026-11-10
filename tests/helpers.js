import { act } from '@testing-library/react';
import { vi } from 'vitest';

// Only fake the timer APIs the exercises use, so React's own scheduler
// (setImmediate / MessageChannel) keeps working normally.
export function useFakeTimers() {
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
  });
}

export function advance(ms) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

export function pendingTimers() {
  return vi.getTimerCount();
}
