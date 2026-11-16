import { memo, useCallback, useState } from 'react';
import { trackRender } from './renderTracker.js';

// memo: skip re-rendering while props are referentially equal.
const Toolbar = memo(function Toolbar({ onClear, onUppercase }) {
  trackRender('toolbar');
  return (
    <div>
      <button onClick={onClear}>Clear</button>
      <button onClick={onUppercase}>UPPERCASE</button>
    </div>
  );
});

export default function NoteEditor() {
  const [text, setText] = useState('');

  // useCallback: same function object on every render, so memo can do its job.
  const clear = useCallback(() => setText(''), []);
  // Functional update: no need to depend on `text`, so no stale closure.
  const uppercase = useCallback(() => setText((t) => t.toUpperCase()), []);

  return (
    <div>
      <Toolbar onClear={clear} onUppercase={uppercase} />
      <label htmlFor="note">Note</label>
      <br />
      <textarea id="note" value={text} onChange={(e) => setText(e.target.value)} />
      <p data-testid="length">{text.length} characters</p>
    </div>
  );
}
