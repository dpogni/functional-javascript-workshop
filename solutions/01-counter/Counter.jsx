import { useState } from 'react';

export default function Counter({ initialValue = 0 }) {
  const [count, setCount] = useState(initialValue);

  return (
    <div>
      <p>
        Count: <span data-testid="count">{count}</span>
      </p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <button onClick={() => setCount((c) => Math.max(0, c - 1))} disabled={count === 0}>
        Decrement
      </button>
      <button onClick={() => setCount(initialValue)}>Reset</button>
    </div>
  );
}
