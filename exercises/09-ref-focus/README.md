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

<details><summary>Topics to read (official React docs)</summary>

- [Manipulating the DOM with refs](https://react.dev/learn/manipulating-the-dom-with-refs)
- [`useRef` reference](https://react.dev/reference/react/useRef)
- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
- [Responding to events](https://react.dev/learn/responding-to-events)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** some things are not expressible as "render this JSX"; focusing an element is a command you issue to a real DOM node.

**Key concepts**

- **A ref is a handle on a DOM node.** `const inputRef = useRef(null)` creates a box; `<input ref={inputRef}>` makes React put the node in `inputRef.current` once the element exists, and set it back to `null` when it is removed.
- **Refs are empty during the first render.** The node does not exist until React commits. So anything that touches `ref.current` belongs in an effect or an event handler, never in the render body.
- **`useEffect(fn, [])`** runs after the first commit: the earliest safe moment to call `.focus()`.
- **Event handlers can use refs directly.** By the time a click happens, the DOM is there. No effect is needed for "clear, then refocus".

**How the solution works**

State holds the query (it is displayed, so it must be state). The ref holds the input node. A mount effect focuses it. One `clear` function does `setQuery('')` and `inputRef.current.focus()`, and is shared by the button's `onClick` and by `onKeyDown` when `e.key === 'Escape'`.

**State or ref?**

If changing the value should change what is on screen, it is state. If it is a handle or bookkeeping that rendering does not read, it is a ref. Changing a ref never triggers a render.

**A simpler alternative, and its limit**

The `autoFocus` attribute also focuses on mount. It cannot give focus *back* after the Clear button takes it, which is the part that needs a ref.
</details>
