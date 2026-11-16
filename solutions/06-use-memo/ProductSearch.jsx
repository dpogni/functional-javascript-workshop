import { useMemo, useState } from 'react';
import { slowFilter } from './slowFilter.js';

export default function ProductSearch({ products }) {
  const [query, setQuery] = useState('');
  const [compact, setCompact] = useState(false);

  const results = useMemo(() => slowFilter(products, query), [products, query]);

  return (
    <div data-testid="wrapper" data-compact={String(compact)}>
      <label>
        Search <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <label>
        <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />
        Compact view
      </label>
      <p data-testid="count">{results.length} results</p>
      <ul>
        {results.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
