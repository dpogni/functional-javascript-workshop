import { render, screen, fireEvent } from '@testing-library/react';
import NoteEditor from '@ex/07-memo-callback/NoteEditor.jsx';
import { getRenderCounts, resetRenderCounts } from '@ex/07-memo-callback/renderTracker.js';

const note = () => screen.getByLabelText('Note');
const type = (value) => fireEvent.change(note(), { target: { value } });

beforeEach(() => resetRenderCounts());

describe('07 · React.memo + useCallback: one stable child', () => {
  test('Toolbar renders once on mount (trackRender still called)', () => {
    render(<NoteEditor />);
    expect(getRenderCounts()).toEqual({ toolbar: 1 });
  });

  test('typing updates the note and the character count', () => {
    render(<NoteEditor />);
    type('hello');
    expect(note()).toHaveValue('hello');
    expect(screen.getByTestId('length')).toHaveTextContent('5 characters');
  });

  test('Clear empties the note', () => {
    render(<NoteEditor />);
    type('hello');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(note()).toHaveValue('');
  });

  test('UPPERCASE acts on the latest text (no stale closure)', () => {
    render(<NoteEditor />);
    type('hello');
    fireEvent.click(screen.getByRole('button', { name: 'UPPERCASE' }));
    expect(note()).toHaveValue('HELLO');
    type('HELLO world');
    fireEvent.click(screen.getByRole('button', { name: 'UPPERCASE' }));
    expect(note()).toHaveValue('HELLO WORLD');
  });

  test('typing re-renders Toolbar zero times', () => {
    render(<NoteEditor />);
    resetRenderCounts();
    type('h');
    type('he');
    type('hey');
    expect(getRenderCounts()).toEqual({});
  });

  test('using the toolbar buttons re-renders Toolbar zero times', () => {
    render(<NoteEditor />);
    type('hey');
    resetRenderCounts();
    fireEvent.click(screen.getByRole('button', { name: 'UPPERCASE' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(note()).toHaveValue('');
    expect(getRenderCounts()).toEqual({});
  });
});
