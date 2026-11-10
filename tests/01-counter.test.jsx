import { render, screen, fireEvent, act } from '@testing-library/react';
import Counter from '@ex/01-counter/Counter.jsx';

const count = () => screen.getByTestId('count').textContent.trim();
const btn = (name) => screen.getByRole('button', { name });

describe('01 · Counter with reset', () => {
  test('starts at 0 by default', () => {
    render(<Counter />);
    expect(count()).toBe('0');
  });

  test('starts at initialValue when given', () => {
    render(<Counter initialValue={5} />);
    expect(count()).toBe('5');
  });

  test('Increment and Decrement change the count by 1', () => {
    render(<Counter />);
    fireEvent.click(btn('Increment'));
    fireEvent.click(btn('Increment'));
    expect(count()).toBe('2');
    fireEvent.click(btn('Decrement'));
    expect(count()).toBe('1');
  });

  test('Decrement is disabled at 0 and the count never goes negative', () => {
    render(<Counter />);
    expect(btn('Decrement')).toBeDisabled();
    fireEvent.click(btn('Decrement'));
    expect(count()).toBe('0');
    fireEvent.click(btn('Increment'));
    expect(btn('Decrement')).toBeEnabled();
  });

  test('Reset returns to initialValue', () => {
    render(<Counter initialValue={3} />);
    fireEvent.click(btn('Increment'));
    fireEvent.click(btn('Increment'));
    fireEvent.click(btn('Reset'));
    expect(count()).toBe('3');
  });

  test('rapid clicks batched into one render are not lost (functional updates)', () => {
    render(<Counter />);
    const inc = btn('Increment');
    act(() => {
      inc.click();
      inc.click();
      inc.click();
    });
    expect(count()).toBe('3');
  });

  test('rapid batched decrements also use the latest value', () => {
    render(<Counter initialValue={5} />);
    const dec = btn('Decrement');
    act(() => {
      dec.click();
      dec.click();
    });
    expect(count()).toBe('3');
  });
});
