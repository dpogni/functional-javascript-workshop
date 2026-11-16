import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagInput from '@ex/19-tag-input/TagInput.jsx';

const input = () => screen.getByLabelText('Add tag');
const tags = () =>
  screen.queryAllByRole('listitem').map((li) => {
    const clone = li.cloneNode(true);
    clone.querySelectorAll('button').forEach((b) => b.remove());
    return clone.textContent.trim();
  });

describe('19 · Keyboard events: tag input', () => {
  test('renders initialTags', () => {
    render(<TagInput initialTags={['react', 'hooks']} />);
    expect(tags()).toEqual(['react', 'hooks']);
  });

  test('Enter adds a tag and clears the input', async () => {
    const user = userEvent.setup();
    render(<TagInput />);
    await user.type(input(), 'react{Enter}');
    expect(tags()).toEqual(['react']);
    expect(input()).toHaveValue('');
    await user.type(input(), 'hooks{Enter}');
    expect(tags()).toEqual(['react', 'hooks']);
  });

  test('typing without Enter adds nothing', async () => {
    const user = userEvent.setup();
    render(<TagInput />);
    await user.type(input(), 'react');
    expect(tags()).toEqual([]);
    expect(input()).toHaveValue('react');
  });

  test('trims tags and ignores blank ones', async () => {
    const user = userEvent.setup();
    render(<TagInput />);
    await user.type(input(), '{Enter}');
    await user.type(input(), '   {Enter}');
    expect(tags()).toEqual([]);
    await user.clear(input());
    await user.type(input(), '  css  {Enter}');
    expect(tags()).toEqual(['css']);
  });

  test('duplicates are not added, but the input is cleared', async () => {
    const user = userEvent.setup();
    render(<TagInput initialTags={['react']} />);
    await user.type(input(), 'react{Enter}');
    expect(tags()).toEqual(['react']);
    expect(input()).toHaveValue('');
  });

  test('the Remove button removes that tag', async () => {
    const user = userEvent.setup();
    render(<TagInput initialTags={['react', 'hooks', 'css']} />);
    await user.click(screen.getByRole('button', { name: 'Remove hooks' }));
    expect(tags()).toEqual(['react', 'css']);
  });

  test('Backspace on an empty input removes the last tag', async () => {
    const user = userEvent.setup();
    render(<TagInput initialTags={['react', 'hooks', 'css']} />);
    await user.click(input());
    await user.keyboard('{Backspace}');
    expect(tags()).toEqual(['react', 'hooks']);
    await user.keyboard('{Backspace}');
    expect(tags()).toEqual(['react']);
  });

  test('Backspace with text only edits the text', async () => {
    const user = userEvent.setup();
    render(<TagInput initialTags={['react']} />);
    await user.type(input(), 'ab{Backspace}');
    expect(input()).toHaveValue('a');
    expect(tags()).toEqual(['react']);
    await user.keyboard('{Backspace}');
    expect(input()).toHaveValue('');
    expect(tags()).toEqual(['react']);
    await user.keyboard('{Backspace}');
    expect(tags()).toEqual([]);
  });

  test('Backspace with no tags and no text does nothing harmful', async () => {
    const user = userEvent.setup();
    render(<TagInput />);
    await user.click(input());
    await user.keyboard('{Backspace}{Backspace}');
    expect(tags()).toEqual([]);
  });
});
