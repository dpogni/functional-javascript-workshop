import { useState } from 'react';

export default function Greeting({ maxLength = 20 }) {
  const [name, setName] = useState('');
  const trimmed = name.trim(); // derived, not stored

  return (
    <div>
      <label htmlFor="name">Name</label>{' '}
      <input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, maxLength))}
      />
      <button onClick={() => setName('')} disabled={name === ''}>
        Clear
      </button>
      <p data-testid="greeting">Hello, {trimmed || 'stranger'}!</p>
      <p data-testid="chars">
        {name.length}/{maxLength}
      </p>
    </div>
  );
}
