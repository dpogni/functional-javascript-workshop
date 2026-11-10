import { useRef, useState } from 'react';

export default function OtpInput({ length = 6, onComplete }) {
  const [digits, setDigits] = useState(() => Array(length).fill(''));
  const inputs = useRef([]);

  const focus = (i) => {
    const el = inputs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
  };

  const commit = (next) => {
    setDigits(next);
    if (next.every((d) => d !== '')) onComplete?.(next.join(''));
  };

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    if (!digit) return; // ignore non-digits (Backspace is handled in keydown)
    const next = [...digits];
    next[i] = digit;
    commit(next);
    focus(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (digits[i]) {
        next[i] = '';
      } else if (i > 0) {
        next[i - 1] = '';
        focus(i - 1);
      }
      setDigits(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focus(i - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focus(i + 1);
    }
  };

  const handlePaste = (i, e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    const next = [...digits];
    let last = i - 1;
    for (let k = 0; k < pasted.length && i + k < length; k++) {
      next[i + k] = pasted[k];
      last = i + k;
    }
    commit(next);
    focus(last + 1);
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label={`Digit ${i + 1} of ${length}`}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
          style={{ width: 40, height: 48, fontSize: 24, textAlign: 'center' }}
        />
      ))}
    </div>
  );
}
