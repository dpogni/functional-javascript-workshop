import { memo, useCallback, useState } from 'react';
import { trackRender } from './renderTracker.js';

const TodoRow = memo(function TodoRow({ todo, onToggle }) {
  trackRender(todo.id);
  return (
    <li>
      <label>
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        {todo.text}
      </label>
    </li>
  );
});

export default function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [clicks, setClicks] = useState(0);

  const toggle = useCallback((id) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  return (
    <div>
      <button onClick={() => setClicks((c) => c + 1)}>Clicks: {clicks}</button>
      <ul>
        {todos.map((todo) => (
          <TodoRow key={todo.id} todo={todo} onToggle={toggle} />
        ))}
      </ul>
    </div>
  );
}
