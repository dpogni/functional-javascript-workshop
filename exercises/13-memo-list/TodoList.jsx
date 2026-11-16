import { useState } from 'react';
import { trackRender } from './renderTracker.js';

// This component works, but every row re-renders on every state change.
// Make it fast (see README.md). Keep the trackRender call!
function TodoRow({ todo, onToggle }) {
  trackRender(todo.id);
  return (
    <li>
      <label>
        <input type="checkbox" checked={todo.done} onChange={onToggle} />
        {todo.text}
      </label>
    </li>
  );
}

export default function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [clicks, setClicks] = useState(0);

  const toggle = (id) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div>
      <button onClick={() => setClicks(clicks + 1)}>Clicks: {clicks}</button>
      <ul>
        {todos.map((todo) => (
          <TodoRow key={todo.id} todo={todo} onToggle={() => toggle(todo.id)} />
        ))}
      </ul>
    </div>
  );
}
