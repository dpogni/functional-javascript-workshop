# 06 · useDebounce

**Level:** Intermediate · **Topic:** Custom hooks · **File:** `useDebounce.js`

The one to definitely practice. Typical use: only fire a search request once
the user has stopped typing.

## Requirements

`export default function useDebounce(value, delay = 500)`

- On the first render, returns `value` immediately.
- When `value` changes, keep returning the **old** value until `value` has
  stayed unchanged for `delay` ms, then return the new value.
- Every new change restarts the wait (only the *last* value in a burst wins;
  intermediate values are never returned).
- If `delay` changes while a wait is in progress, restart the wait using the
  **new** delay, counted from the moment of the change.
- Never more than one pending timer; unmounting leaves **zero** pending timers
  (no `setState` on an unmounted component).

## Check it

```bash
npm run check 6
```

<details><summary>Hint</summary>

Keep the debounced value in state. In a `useEffect` with `[value, delay]` as
dependencies, start a `setTimeout` that copies `value` into state, and return a
cleanup that clears it. The cleanup is what "restarts" the wait.
</details>
