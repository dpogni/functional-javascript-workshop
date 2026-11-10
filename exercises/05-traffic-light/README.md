# 05 · Self-cycling traffic light

**Level:** Intermediate · **Topic:** Effects & timers · **File:** `TrafficLight.jsx`

The layout is already written. You only write the **timing logic**. Most
solutions break on cleanup, so the grader checks that too.

## Requirements

`export default function TrafficLight({ durations = DEFAULT_DURATIONS })`

- Starts on **red**.
- Cycles **red → green → yellow → red → ...** forever.
- Each light stays on for its own duration (in ms) from `durations`
  (default: red 4000, green 3000, yellow 1000).
- Exactly one light has `data-active="true"`; the others have `"false"`.
- There is never more than **one** pending timer at a time (no stacked
  intervals or forgotten timeouts on re-render).
- Unmounting the component leaves **zero** pending timers.

## Check it

```bash
npm run check 5
```

<details><summary>Hint</summary>

Since each light has a different duration, a single `setInterval` is awkward.
Use a `setTimeout` inside a `useEffect` that depends on the current light: when
it fires, move to the next light, which re-runs the effect and schedules the
next timeout. Return `() => clearTimeout(id)` from the effect.
</details>
