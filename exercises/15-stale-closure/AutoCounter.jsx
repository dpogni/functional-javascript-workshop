import { useEffect, useState } from 'react';

// 🐛 This counter gets stuck at 1. Fix every bug (see README.md).
export default function AutoCounter({ interval = 1000 }) {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (running) {
      setInterval(() => {
        setCount(count + 1);
      }, interval);
    }
  }, []);

  return (
    <div>
      <p>
        Count: <span data-testid="count">{count}</span>
      </p>
      <button onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Resume'}</button>
    </div>
  );
}
