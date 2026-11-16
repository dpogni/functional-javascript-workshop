import { render, screen, fireEvent } from '@testing-library/react';
import SaveButton from '@ex/14-timeout-cleanup/SaveButton.jsx';
import { useFakeTimers, advance, pendingTimers } from './helpers.js';

const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save' }));
const status = () => screen.queryByRole('status');

beforeEach(() => useFakeTimers());

describe('14 · setTimeout with cleanup: "Saved!" flash', () => {
  test('no message and no timer before the first click', () => {
    render(<SaveButton />);
    expect(status()).not.toBeInTheDocument();
    expect(pendingTimers()).toBe(0);
  });

  test('clicking Save shows "Saved!"', () => {
    render(<SaveButton />);
    save();
    expect(status()).toHaveTextContent('Saved!');
  });

  test('the message hides after 2000ms by default', () => {
    render(<SaveButton />);
    save();
    advance(1999);
    expect(status()).toBeInTheDocument();
    advance(1);
    expect(status()).not.toBeInTheDocument();
    expect(pendingTimers()).toBe(0);
  });

  test('respects the duration prop', () => {
    render(<SaveButton duration={500} />);
    save();
    advance(499);
    expect(status()).toBeInTheDocument();
    advance(1);
    expect(status()).not.toBeInTheDocument();
  });

  test('clicking again restarts the countdown', () => {
    render(<SaveButton />);
    save();
    advance(1500);
    save();
    advance(1500); // 3000ms after first click, 1500ms after second
    expect(status()).toBeInTheDocument();
    advance(499);
    expect(status()).toBeInTheDocument();
    advance(1);
    expect(status()).not.toBeInTheDocument();
  });

  test('can be shown again after hiding', () => {
    render(<SaveButton />);
    save();
    advance(2000);
    save();
    expect(status()).toBeInTheDocument();
    advance(2000);
    expect(status()).not.toBeInTheDocument();
  });

  test('never has more than one pending timer', () => {
    render(<SaveButton />);
    for (let i = 0; i < 5; i++) {
      save();
      advance(100);
      expect(pendingTimers()).toBe(1);
    }
  });

  test('clears its timer on unmount', () => {
    const { unmount } = render(<SaveButton />);
    save();
    unmount();
    expect(pendingTimers()).toBe(0);
  });
});
