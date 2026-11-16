import { useEffect, useState } from 'react';

export default function SaveButton({ duration = 2000 }) {
  // 0 = hidden. Any other number = "the Nth save"; changing it restarts the effect.
  const [saveCount, setSaveCount] = useState(0);

  useEffect(() => {
    if (saveCount === 0) return undefined;
    const id = setTimeout(() => setSaveCount(0), duration);
    // Runs before the next effect (a new click) and on unmount.
    return () => clearTimeout(id);
  }, [saveCount, duration]);

  return (
    <div>
      <button onClick={() => setSaveCount((n) => n + 1)}>Save</button>
      {saveCount > 0 && <span role="status">Saved!</span>}
    </div>
  );
}
