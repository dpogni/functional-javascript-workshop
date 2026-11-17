# 01 · Counter with reset

**Stage:** 1 · State & props · **Level:** Beginner · **Topic:** Hooks & state · **File:** `Counter.jsx` · ★ Interview problem

**Start here.** No prior exercises needed: just `useState`.

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

<details><summary>Topics to read (official React docs)</summary>

- [State: a component's memory](https://react.dev/learn/state-a-components-memory)
- [State as a snapshot](https://react.dev/learn/state-as-a-snapshot)
- [Queueing a series of state updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- [`useState` reference](https://react.dev/reference/react/useState)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** keep a number in state and change it from three buttons, without ever losing an update.

**Key concepts**

- **State is a snapshot.** Inside one render, `count` is a constant. A click handler created during that render sees that render's `count` forever. Calling `setCount` does not change the variable; it asks React for a *new* render with a new value.
- **Updates are queued and batched.** React waits until the event handler finishes, then processes all queued updates and renders once. So `setCount(count + 1)` three times in a row queues "set to 1" three times. The result is 1, not 3.
- **Updater functions fix this.** `setCount(c => c + 1)` queues an *instruction* ("add one to whatever it is by then"). React runs the instructions in order, passing each one the result of the previous one.

**How the solution works**

`useState(initialValue)` reads the prop once, on the first render. Increment and decrement use updater functions; decrement is clamped with `Math.max(0, c - 1)` and the button is also `disabled` at 0, so the floor holds both in the UI and in the logic. Reset calls `setCount(initialValue)`: a plain value is fine there because the next value does not depend on the previous one.

**What an interviewer is looking for**

That you reach for `c => c + 1` without being prompted, and can explain *why*: the next state depends on the previous state, and the value in the closure may be stale. A good rule to say out loud: "if the new state is computed from the old state, pass a function".
</details>
