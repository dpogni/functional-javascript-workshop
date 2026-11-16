# 10 · Your first custom hook: useToggle

**Stage:** 3 · Refs, effects & custom hooks · **Level:** Warm-up · **Topic:** Custom hooks · **File:** `useToggle.js`

**Builds on:** functional updates (01) and `useCallback` (07).  
**New here:** a custom hook is just a function whose name starts with `use`
and that calls other hooks. It lets you package stateful logic and reuse it.
Nothing new to learn about React itself; this is about the *shape*.

## Requirements

`export default function useToggle(initial = false)`

Returns an object `{ on, toggle, setOn, setOff }`:

- `on`: the current boolean, starting at `initial`.
- `toggle()`: flips it.
- `setOn()` / `setOff()`: force it to `true` / `false`.
- Calling `toggle()` twice in a row (in the same batch) must end up where it
  started. So: functional updates.
- `toggle`, `setOn` and `setOff` keep the **same function identity** across
  renders, so they're safe to pass to memoized children or effect deps.
- Two components using `useToggle` each get their own independent state.

## Check it

```bash
npm run check 10
```

<details><summary>Hint</summary>

```js
const [on, setValue] = useState(initial);
const toggle = useCallback(() => setValue((v) => !v), []);
```
Same pattern for `setOn` / `setOff`. Then `return { on, toggle, setOn, setOff }`.
</details>
