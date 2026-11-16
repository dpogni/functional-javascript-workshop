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
