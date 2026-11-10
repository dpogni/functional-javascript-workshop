import { render, screen, fireEvent } from '@testing-library/react';
import TodoList from '@ex/04-memo-list/TodoList.jsx';
import { getRenderCounts, resetRenderCounts } from '@ex/04-memo-list/renderTracker.js';

const todos = () => [
  { id: 1, text: 'Write tests', done: false },
  { id: 2, text: 'Ship it', done: false },
  { id: 3, text: 'Celebrate', done: true },
];

beforeEach(() => resetRenderCounts());

describe('04 · Stop wasteful list re-renders', () => {
  test('renders every todo once on mount (trackRender still called)', () => {
    render(<TodoList initialTodos={todos()} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    expect(getRenderCounts()).toEqual({ 1: 1, 2: 1, 3: 1 });
  });

  test('toggling a todo still works (and works repeatedly)', () => {
    render(<TodoList initialTodos={todos()} />);
    const box = screen.getByLabelText('Ship it');
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    expect(box).toBeChecked();
    fireEvent.click(box);
    expect(box).not.toBeChecked();
    fireEvent.click(screen.getByLabelText('Write tests'));
    fireEvent.click(box);
    expect(screen.getByLabelText('Write tests')).toBeChecked();
    expect(box).toBeChecked();
    expect(screen.getByLabelText('Celebrate')).toBeChecked();
  });

  test('the Clicks button still counts', () => {
    render(<TodoList initialTodos={todos()} />);
    fireEvent.click(screen.getByRole('button', { name: /clicks/i }));
    fireEvent.click(screen.getByRole('button', { name: /clicks/i }));
    expect(screen.getByRole('button', { name: /clicks/i })).toHaveTextContent('Clicks: 2');
  });

  test('clicking the unrelated Clicks button re-renders zero rows', () => {
    render(<TodoList initialTodos={todos()} />);
    resetRenderCounts();
    fireEvent.click(screen.getByRole('button', { name: /clicks/i }));
    fireEvent.click(screen.getByRole('button', { name: /clicks/i }));
    expect(getRenderCounts()).toEqual({});
  });

  test('toggling one todo re-renders only that row', () => {
    render(<TodoList initialTodos={todos()} />);
    resetRenderCounts();
    fireEvent.click(screen.getByLabelText('Ship it'));
    expect(getRenderCounts()).toEqual({ 2: 1 });
    resetRenderCounts();
    fireEvent.click(screen.getByLabelText('Celebrate'));
    expect(getRenderCounts()).toEqual({ 3: 1 });
  });
});
