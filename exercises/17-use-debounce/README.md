# 17 · useDebounce

**Stage:** 5 · Timers · **Level:** Intermediate · **Topic:** Custom hooks · **File:** `useDebounce.js` · ★ Interview problem

**Builds on:** custom hooks (10) and timeout cleanup (14).  
**New here:** packaging the restart-the-timer pattern from 14 into a reusable hook.

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
npm run check 17
```

<details><summary>Hint</summary>

Keep the debounced value in state. In a `useEffect` with `[value, delay]` as
dependencies, start a `setTimeout` that copies `value` into state, and return a
cleanup that clears it. The cleanup is what "restarts" the wait.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Reusing logic with custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
- [Lifecycle of reactive effects](https://react.dev/learn/lifecycle-of-reactive-effects)
- [`useEffect` reference](https://react.dev/reference/react/useEffect)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** return a copy of a value that only catches up once the original has stopped changing for a while.

**Key concepts**

- **Debounce.** Wait for a quiet period before acting. Typical use: do not send a search request on every keystroke, only when the user pauses.
- **It is exercise 14 again, as a hook.** A timeout is started in an effect and cleared in its cleanup. The cleanup *is* the debounce: each new value cancels the pending timer and starts another, so only the last value in a burst survives.

**How the solution works**

```js
const [debounced, setDebounced] = useState(value);
useEffect(() => {
  const id = setTimeout(() => setDebounced(value), delay);
  return () => clearTimeout(id);
}, [value, delay]);
return debounced;
```

- `useState(value)` makes the first render return the value immediately.
- When `value` changes, cleanup clears the old timer and setup starts a new one. If nothing changes for `delay` ms, the timer fires and state updates, causing one render with the new debounced value.
- `delay` is a dependency too, so changing it mid-wait restarts the wait with the new delay.
- On unmount the cleanup clears the timer, so there is no state update on an unmounted component.

**Debounce versus throttle**

Debounce fires once after activity stops. Throttle fires at most once per interval *during* activity. Interviewers often ask for the difference, or ask you to write the other one.

**Debouncing a value versus debouncing a function**

This hook debounces a value, which composes well with React: `const q = useDebounce(query, 300)` and then an effect that fetches on `[q]`. Debouncing a callback is harder, because the function is recreated on every render and each copy would have its own timer; it needs the ref pattern from exercise 18.
</details>
