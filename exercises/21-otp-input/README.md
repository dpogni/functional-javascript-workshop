# 21 · OTP input: verification code boxes

**Stage:** 6 · Keyboard & focus · **Level:** Advanced · **Topic:** Forms, events & refs · **File:** `OtpInput.jsx` · ★ Interview problem

**Builds on:** `onKeyDown` (19) and an array of refs with focus movement (20).  
**New here:** putting both together, plus paste handling.

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
npm run check 21
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

<details><summary>Topics to read (official React docs)</summary>

- [Manipulating the DOM with refs](https://react.dev/learn/manipulating-the-dom-with-refs)
- [Responding to events](https://react.dev/learn/responding-to-events)
- [Updating arrays in state](https://react.dev/learn/updating-arrays-in-state)
- [`<input>` reference (controlled inputs)](https://react.dev/reference/react-dom/components/input)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** several one-character inputs must behave like a single field for typing, deleting, navigating and pasting.

**The design**

- **State:** an array of `length` strings. That is the single source of truth; every input is controlled by its slot.
- **Refs:** an array of input nodes, used only to move focus.
- **Three handlers,** each receiving the box index: `onChange` for typing, `onKeyDown` for Backspace and arrows, `onPaste` for the clipboard.

**Typing**

`e.target.value.replace(/\D/g, '').slice(-1)` strips non-digits and takes the *last* character. Taking the last one is what allows replacing a filled box: the input briefly holds two characters ("39") and you keep the new one. `maxLength={1}` would have the browser reject the second character, so overwriting would be impossible unless you also select the text on focus. After storing the digit, focus moves to `i + 1`, clamped at the last box.

**Backspace**

Handled in `onKeyDown`, because on an empty box no `change` event fires at all. Two cases: the box has a digit → clear it and stay; the box is empty → clear the previous box and move there. This lets the user hold Backspace to erase the whole code.

**Paste**

`e.preventDefault()` stops the browser from inserting the text into one box. Read `e.clipboardData.getData('text')`, strip non-digits, and write the characters into consecutive slots starting at the current box, stopping at the end. Then focus the box after the last one filled.

**Completion**

`onComplete` is called from the same code path that writes a digit (`commit`), right after computing the next array, when every slot is non-empty. Doing this in an effect on `[digits]` is the common bug: it would also fire on re-renders where the parent passes a new `onComplete`, and it needs the callback as a dependency.

**What an interviewer is looking for**

A clear state model before any code, edge cases named up front (replace, Backspace on empty, paste in the middle, overflow), and accessibility details: `inputMode="numeric"`, a label per box, `autoComplete="one-time-code"` so phones can offer the code from an SMS.
</details>
