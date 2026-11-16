# 09 · useRef + useEffect: focus management

**Stage:** 3 · Refs, effects & custom hooks · **Level:** Warm-up · **Topic:** DOM refs & mount effects · **File:** `SearchBox.jsx`

**Builds on:** controlled inputs (02).  
**New here:** two hooks at once, in their simplest form.
`useRef` gives you a handle on a real DOM node (so you can call `.focus()`),
and `useEffect` lets you run code *after* React has put things on screen.

## Requirements

`export default function SearchBox()`

- A controlled text input labelled **Search**.
- The input is **focused when the component mounts**.
- A **Clear** button that empties the input **and puts focus back in the input**
  (clicking a button normally steals focus).
- Pressing `Escape` inside the input also clears it (focus stays in the input).
- `data-testid="query"` shows `Searching for: <text>` while there is text, and
  `Type to search` when empty.

## Check it

```bash
npm run check 9
```

<details><summary>Hint</summary>

```js
const inputRef = useRef(null);
useEffect(() => { inputRef.current.focus(); }, []);   // [] = run once, after mount
...
<input ref={inputRef} ... />
```
In the Clear handler, call `inputRef.current.focus()` after `setQuery('')`.
For Escape, use `onKeyDown` and check `e.key === 'Escape'`.
</details>
