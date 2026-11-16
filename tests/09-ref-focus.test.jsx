import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '@ex/09-ref-focus/SearchBox.jsx';

const input = () => screen.getByLabelText('Search');
const query = () => screen.getByTestId('query').textContent.trim();

describe('09 · useRef + useEffect: focus management', () => {
  test('the input is focused on mount', () => {
    render(<SearchBox />);
    expect(input()).toHaveFocus();
  });

  test('typing updates the query text', async () => {
    const user = userEvent.setup();
    render(<SearchBox />);
    expect(query()).toBe('Type to search');
    await user.keyboard('hooks');
    expect(input()).toHaveValue('hooks');
    expect(query()).toBe('Searching for: hooks');
  });

  test('Clear empties the input and returns focus to it', async () => {
    const user = userEvent.setup();
    render(<SearchBox />);
    await user.keyboard('hooks');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(input()).toHaveValue('');
    expect(query()).toBe('Type to search');
    expect(input()).toHaveFocus();
    await user.keyboard('refs');
    expect(input()).toHaveValue('refs');
  });

  test('Escape clears the input and keeps focus', async () => {
    const user = userEvent.setup();
    render(<SearchBox />);
    await user.keyboard('hooks{Escape}');
    expect(input()).toHaveValue('');
    expect(input()).toHaveFocus();
  });

  test('other keys do not clear the input', async () => {
    const user = userEvent.setup();
    render(<SearchBox />);
    await user.keyboard('ab{Enter}{ArrowLeft}c');
    expect(input().value).toHaveLength(3);
  });
});
