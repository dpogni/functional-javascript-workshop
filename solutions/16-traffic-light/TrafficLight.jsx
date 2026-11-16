import { useEffect, useState } from 'react';

export const DEFAULT_DURATIONS = { red: 4000, green: 3000, yellow: 1000 };
const ORDER = ['red', 'green', 'yellow'];

export default function TrafficLight({ durations = DEFAULT_DURATIONS }) {
  const [active, setActive] = useState('red');

  useEffect(() => {
    const id = setTimeout(() => {
      setActive((current) => ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
    }, durations[active]);
    return () => clearTimeout(id);
  }, [active, durations]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 8, padding: 12, background: '#222', borderRadius: 12 }}>
      {ORDER.map((color) => (
        <div
          key={color}
          data-testid={`light-${color}`}
          data-active={String(active === color)}
          aria-label={color}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: color,
            opacity: active === color ? 1 : 0.25,
          }}
        />
      ))}
    </div>
  );
}
