import { useEffect, useState } from 'react';

export default function AutoCounter({ interval = 1000 }) {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      // Fix 1: functional update, so we never read a stale `count` from the first render.
      setCount((c) => c + 1);
    }, interval);
    // Fix 2: clean up, so pausing / re-running / unmounting doesn't leak intervals.
    return () => clearInterval(id);
    // Fix 3: re-run when `running` or `interval` change.
  }, [running, interval]);

  return (
    <div>
      <p>
        Count: <span data-testid="count">{count}</span>
      </p>
      <button onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Resume'}</button>
    </div>
  );
}
