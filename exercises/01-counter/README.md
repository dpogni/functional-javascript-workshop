# 01 · Counter with reset

**Level:** Beginner · **Topic:** Hooks & state · **File:** `Counter.jsx`

The classic warm-up. Interviewers use it to see whether you reach for
*functional* state updates when the next value depends on the previous one.

## Requirements

`export default function Counter({ initialValue = 0 })`

- Show the current count inside an element with `data-testid="count"`.
- Three buttons, with exactly this text: **Increment**, **Decrement**, **Reset**.
- **Increment** adds 1, **Decrement** subtracts 1.
- The count may never go below `0`: **Decrement** must be `disabled` at 0.
- **Reset** returns to `initialValue` (not always to 0).
- Rapid clicks must never be lost. Several clicks that React batches into one
  render must all count (3 clicks in one batch → +3).

## Check it

```bash
npm run check 1
```

<details><summary>Hint</summary>

`setCount(count + 1)` closes over the `count` from the render the handler was
created in. If React batches three clicks before re-rendering, all three see
the same `count`. Pass a function instead: `setCount(c => c + 1)`.
</details>
