import { useState } from 'react';

export default function TagInput({ initialTags = [] }) {
  const [tags, setTags] = useState(initialTags);
  const [draft, setDraft] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = draft.trim();
      if (tag && !tags.includes(tag)) setTags([...tags, tag]);
      setDraft('');
    } else if (e.key === 'Backspace' && draft === '') {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div>
      <ul style={{ display: 'flex', gap: 6, listStyle: 'none', padding: 0 }}>
        {tags.map((tag) => (
          <li key={tag}>
            {tag}{' '}
            <button aria-label={`Remove ${tag}`} onClick={() => setTags(tags.filter((t) => t !== tag))}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <label htmlFor="tag">Add tag</label>{' '}
      <input id="tag" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown} />
    </div>
  );
}
