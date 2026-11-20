import { useState } from 'react';

export default function StarRating({ max = 5, initialRating = 0, onChange }) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0); // 0 = pointer not over a star
  const shown = hover || rating;

  const select = (n) => {
    const next = n === rating ? 0 : n; // clicking the current rating clears it
    setRating(next);
    onChange?.(next);
  };

  return (
    <section>
      <div
        role="group"
        aria-label="Rating"
        onMouseLeave={() => setHover(0)}
        style={{ display: 'inline-flex', gap: 2 }}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const filled = n <= shown;
          return (
            <button
              key={n}
              type="button"
              aria-label={n === 1 ? '1 star' : `${n} stars`}
              data-filled={String(filled)}
              onClick={() => select(n)}
              onMouseEnter={() => setHover(n)}
              style={{ fontSize: 28, lineHeight: 1, background: 'none', border: 0, cursor: 'pointer', color: filled ? '#f5a623' : '#9aa0a6' }}
            >
              {filled ? '★' : '☆'}
            </button>
          );
        })}
      </div>
      <p data-testid="rating-label">{rating ? `${rating} out of ${max}` : 'No rating'}</p>
    </section>
  );
}
