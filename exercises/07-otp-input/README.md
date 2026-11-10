# 07 · OTP input: verification code boxes

**Level:** Advanced · **Topic:** Forms, events & refs · **File:** `OtpInput.jsx`

A machine-coding favourite that combines refs, keyboard events, and state.

## Requirements

`export default function OtpInput({ length = 6, onComplete })`

**Markup**
- Render `length` text inputs (`<input type="text" inputMode="numeric">`).
- Each input has `aria-label="Digit N of LENGTH"`, e.g. `Digit 1 of 6`.

**Typing**
- Each box holds at most one digit. Non-digits are ignored.
- Typing a digit fills the box and moves focus to the **next** box (on the last
  box, focus stays).
- Typing a digit into an already-filled box **replaces** its digit (and still
  advances). Careful: a plain `maxLength={1}` blocks this.

**Keyboard**
- `Backspace` on a filled box clears it and keeps focus there.
- `Backspace` on an empty box moves focus to the **previous** box and clears it.
- `ArrowLeft` / `ArrowRight` move focus to the previous / next box.

**Paste**
- Pasting into any box spreads the digits across that box and the ones after it
  (`"123456"` pasted into box 1 fills all six boxes).
- Non-digit characters in the pasted text are stripped (`"12-34 56"` → `123456`).
- Extra digits beyond the last box are dropped.
- After pasting, focus moves to the box after the last one filled, or to the last box.

**Completion**
- When every box is filled, call `onComplete(code)` with the joined string, e.g.
  `onComplete('123456')`. Call it once per completion (not on every render).

## Check it

```bash
npm run check 7
```

Tip: `npm run dev` lets you try it in a browser.

<details><summary>Hint</summary>

- State: an array of strings, `Array(length).fill('')`.
- Refs: `const inputs = useRef([])` and `ref={(el) => (inputs.current[i] = el)}`.
- In `onChange`, take the **last** character typed: `e.target.value.slice(-1)`.
- Handle `Backspace`/arrows in `onKeyDown`; handle paste in `onPaste` with
  `e.preventDefault()` and `e.clipboardData.getData('text')`.
- Call `onComplete` from the event handler that fills the final digit, not from
  an effect that runs on every render.
</details>
