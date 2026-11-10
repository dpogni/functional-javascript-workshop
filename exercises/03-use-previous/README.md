# 03 · usePrevious: track the previous value

**Level:** Beginner · **Topic:** Custom hooks · **File:** `usePrevious.js`

## Requirements

`export default function usePrevious(value)`

- Returns the `value` the hook received **on the previous render**.
- Returns `undefined` on the first render.
- "Previous render" means literally that: if the component re-renders with the
  same value, `usePrevious` returns that same value (it tracks renders, not
  changes).
- Must **not** cause any extra renders (no `setState` inside the hook).
- Works with any value type (numbers, strings, objects, `null`...).

## Check it

```bash
npm run check 3
```

<details><summary>Hint</summary>

You need something that persists across renders but doesn't trigger a render
when it changes: `useRef`. Read the ref during render, and write the new value
into it in an effect (which runs *after* the render is committed).
</details>
