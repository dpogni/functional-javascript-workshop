import { useEffect, useRef, useState } from 'react';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // Runs once, after the input exists in the DOM.
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const clear = () => {
    setQuery('');
    inputRef.current.focus();
  };

  return (
    <div>
      <label htmlFor="search">Search</label>{' '}
      <input
        id="search"
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') clear();
        }}
      />
      <button onClick={clear}>Clear</button>
      <p data-testid="query">{query ? `Searching for: ${query}` : 'Type to search'}</p>
    </div>
  );
}
