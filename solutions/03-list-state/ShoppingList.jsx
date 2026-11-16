import { useRef, useState } from 'react';

export default function ShoppingList({ initialItems = [] }) {
  const nextId = useRef(0);
  const makeItem = (text) => ({ id: nextId.current++, text });

  const [items, setItems] = useState(() => initialItems.map(makeItem));
  const [draft, setDraft] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setItems((prev) => [...prev, makeItem(text)]);
    setDraft('');
  };

  const remove = (id) => setItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="new-item">New item</label>{' '}
        <input id="new-item" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <p data-testid="count">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </p>

      {items.length === 0 ? (
        <p>Nothing to buy yet</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.text}{' '}
              <button type="button" aria-label={`Remove ${item.text}`} onClick={() => remove(item.id)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
