# 19 · Keyboard events: tag input

**Stage:** 6 · Keyboard & focus · **Level:** Intermediate · **Topic:** `onKeyDown` · **File:** `TagInput.jsx`

**Builds on:** list state (03).  
**New here:** reacting to specific keys with `onKeyDown` and `e.key`, and
deciding when to `e.preventDefault()`. This is half of what the OTP input (21)
needs; the other half (moving focus between elements) is exercise 20.

## Requirements

`export default function TagInput({ initialTags = [] })`

- A text input labelled **Add tag**.
- Each tag is an `<li>` showing its text and a button with
  `aria-label="Remove <tag>"` that removes it.
- Pressing **Enter** adds the trimmed input text as a new tag (at the end) and
  clears the input.
  - Blank text adds nothing.
  - A tag that already exists (exact match) is not added again, but the input
    is still cleared.
- Pressing **Backspace** while the input is **empty** removes the **last** tag.
- Pressing **Backspace** while the input has text just deletes a character, as
  usual. It must not remove a tag.

## Check it

```bash
npm run check 19
```

<details><summary>Hint</summary>

```js
const handleKeyDown = (e) => {
  if (e.key === 'Enter') { e.preventDefault(); /* add */ }
  else if (e.key === 'Backspace' && draft === '') { /* remove last */ }
};
```
Remove the last tag with `setTags((prev) => prev.slice(0, -1))`.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Responding to events](https://react.dev/learn/responding-to-events)
- [Updating arrays in state](https://react.dev/learn/updating-arrays-in-state)
- [Reacting to input with state](https://react.dev/learn/reacting-to-input-with-state)
- [Rendering lists (and why keys matter)](https://react.dev/learn/rendering-lists)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** give specific keys special meaning in a text input, and leave every other key alone.

**Key concepts**

- **`onKeyDown` and `e.key`.** The handler fires before the browser applies the key's default action. `e.key` is a readable name: `'Enter'`, `'Backspace'`, `'a'`.
- **`e.preventDefault()`** cancels the default action. For Enter this stops an enclosing form from submitting. For Backspace on an empty input there is nothing to cancel.
- **Decide from current state.** "Backspace removes the last tag" applies only when the draft is empty; otherwise Backspace must just delete a character. The condition `draft === ''` is evaluated at keydown time, before the browser deletes anything, so the keypress that empties the input does not also remove a tag.
- **Two pieces of state.** The committed tags (an array) and the draft text (a string). The draft is not a tag until Enter.

**How the solution works**

On Enter: trim the draft; add it if it is non-empty and not already present; clear the draft either way. On Backspace with an empty draft: `setTags(prev => prev.slice(0, -1))`. Remove buttons filter by value. Since duplicates are rejected, the tag text is unique and can serve as the `key` (compare exercise 03, where it could not).

**Common mistakes**

Using `onKeyPress` (deprecated, and it does not fire for Backspace), checking `e.keyCode` numbers, reading the input's value from the DOM instead of from state, and handling Backspace in `onChange`, where you can no longer tell "deleted the last character" from "pressed Backspace on an empty input".

**Accessibility notes worth mentioning**

Each remove button has an `aria-label` naming its tag, because "×" alone means nothing to a screen reader. Real tag inputs also handle composition events for languages typed with an IME.
</details>
