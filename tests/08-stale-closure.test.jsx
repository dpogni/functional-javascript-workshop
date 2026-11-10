import { render, screen, fireEvent } from '@testing-library/react';
import AutoCounter from '@ex/08-stale-closure/AutoCounter.jsx';
import { useFakeTimers, advance, pendingTimers } from './helpers.js';

const count = () => screen.getByTestId('count').textContent.trim();

beforeEach(() => useFakeTimers());

describe('08 · Bug hunt: auto-counter stuck at 1', () => {
  test('starts at 0', () => {
    render(<AutoCounter />);
    expect(count()).toBe('0');
  });

  test('counts up past 1 (no stale closure)', () => {
    render(<AutoCounter />);
    advance(1000);
    expect(count()).toBe('1');
    advance(1000);
    expect(count()).toBe('2');
    advance(1000);
    advance(1000);
    expect(count()).toBe('4');
  });

  test('respects the interval prop', () => {
    render(<AutoCounter interval={250} />);
    advance(249);
    expect(count()).toBe('0');
    advance(1);
    advance(250);
    advance(250);
    expect(count()).toBe('3');
  });

  test('Pause stops counting and leaves no timer running', () => {
    render(<AutoCounter />);
    advance(1000);
    advance(1000);
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('button')).toHaveTextContent('Resume');
    expect(pendingTimers()).toBe(0);
    advance(5000);
    expect(count()).toBe('2');
  });

  test('Resume continues from where it stopped', () => {
    render(<AutoCounter />);
    advance(1000);
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    advance(3000);
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(screen.getByRole('button')).toHaveTextContent('Pause');
    advance(1000);
    expect(count()).toBe('2');
    advance(1000);
    expect(count()).toBe('3');
  });

  test('never has more than one active timer', () => {
    const { rerender } = render(<AutoCounter />);
    for (let i = 0; i < 5; i++) {
      advance(1000);
      rerender(<AutoCounter />);
      expect(pendingTimers()).toBeLessThanOrEqual(1);
    }
  });

  test('changing interval restarts with the new interval', () => {
    const { rerender } = render(<AutoCounter interval={1000} />);
    advance(1000);
    rerender(<AutoCounter interval={100} />);
    advance(100);
    expect(count()).toBe('2');
    expect(pendingTimers()).toBe(1);
  });

  test('clears its timer on unmount', () => {
    const { unmount } = render(<AutoCounter />);
    advance(1500);
    unmount();
    expect(pendingTimers()).toBe(0);
  });
});
