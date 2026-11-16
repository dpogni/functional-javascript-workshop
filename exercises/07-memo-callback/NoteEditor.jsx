import { useState } from 'react';
import { trackRender } from './renderTracker.js';

// This works, but Toolbar re-renders on every keystroke.
// Make it skip those renders (see README.md). Keep the trackRender call!
function Toolbar({ onClear, onUppercase }) {
  trackRender('toolbar');
  return (
    <div>
      <button onClick={onClear}>Clear</button>
      <button onClick={onUppercase}>UPPERCASE</button>
    </div>
  );
}

export default function NoteEditor() {
  const [text, setText] = useState('');

  const clear = () => setText('');
  const uppercase = () => setText(text.toUpperCase());

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
