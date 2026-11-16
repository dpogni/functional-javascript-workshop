import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Greeting from '@ex/02-controlled-input/Greeting.jsx';

const greeting = () => screen.getByTestId('greeting').textContent.trim();
const chars = () => screen.getByTestId('chars').textContent.trim();
const input = () => screen.getByLabelText('Name');

describe('02 · Controlled input: live greeting', () => {
  test('starts empty and greets a stranger', () => {
    render(<Greeting />);
    expect(input()).toHaveValue('');
    expect(greeting()).toBe('Hello, stranger!');
    expect(chars()).toBe('0/20');
  });

  test('greets the typed name live', async () => {
    const user = userEvent.setup();
    render(<Greeting />);
    await user.type(input(), 'Ada');
    expect(input()).toHaveValue('Ada');
    expect(greeting()).toBe('Hello, Ada!');
    expect(chars()).toBe('3/20');
  });

  test('trims the name in the greeting; only-spaces is still a stranger', async () => {
    const user = userEvent.setup();
    render(<Greeting />);
    await user.type(input(), '   ');
    expect(greeting()).toBe('Hello, stranger!');
    expect(chars()).toBe('3/20');
    await user.type(input(), 'Grace ');
    expect(greeting()).toBe('Hello, Grace!');
  });

  test('never holds more than maxLength characters', async () => {
    const user = userEvent.setup();
    render(<Greeting maxLength={5} />);
    await user.type(input(), 'abcdefgh');
    expect(input()).toHaveValue('abcde');
    expect(chars()).toBe('5/5');
  });

  test('Clear empties the input and is disabled when empty', async () => {
    const user = userEvent.setup();
    render(<Greeting />);
    const clear = screen.getByRole('button', { name: 'Clear' });
    expect(clear).toBeDisabled();
    await user.type(input(), 'Linus');
    expect(clear).toBeEnabled();
    await user.click(clear);
    expect(input()).toHaveValue('');
    expect(greeting()).toBe('Hello, stranger!');
    expect(clear).toBeDisabled();
  });
});
