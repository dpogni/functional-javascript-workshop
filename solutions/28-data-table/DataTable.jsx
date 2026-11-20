import { useMemo, useState } from 'react';

function compareValues(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
}

export default function DataTable({ columns, rows, pageSize = 5 }) {
  // State is only what the user chose. Everything shown is derived from it.
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(null); // { key, direction: 'ascending' | 'descending' }
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      columns.some((col) => String(row[col.key]).toLowerCase().includes(q))
    );
  }, [rows, columns, query]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const sign = sort.direction === 'ascending' ? 1 : -1;
    // Copy before sorting: .sort() works in place.
    return [...filtered].sort((a, b) => sign * compareValues(a[sort.key], b[sort.key]));
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount); // in case rows shrank
  const visible = sorted.slice((current - 1) * pageSize, current * pageSize);

  const sortBy = (key) => {
    setSort((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' }
        : { key, direction: 'ascending' }
    );
    setPage(1);
  };

  const arrow = (key) =>
    sort?.key !== key ? '' : sort.direction === 'ascending' ? ' ▲' : ' ▼';

  return (
    <section>
      <label>
        Filter{' '}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </label>

      <table style={{ borderCollapse: 'collapse', marginTop: 8 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} aria-sort={sort?.key === col.key ? sort.direction : 'none'}>
                <button onClick={() => sortBy(col.key)}>
                  {col.label}
                  <span aria-hidden="true">{arrow(col.key)}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>No matching rows</td>
            </tr>
          ) : (
            visible.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '2px 10px' }}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <button onClick={() => setPage(current - 1)} disabled={current === 1}>
          Previous
        </button>
        <span data-testid="page-info">
          Page {current} of {pageCount}
        </span>
        <button onClick={() => setPage(current + 1)} disabled={current === pageCount}>
          Next
        </button>
      </div>
    </section>
  );
}
