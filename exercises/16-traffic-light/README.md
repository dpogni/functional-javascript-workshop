# 16 · Self-cycling traffic light

**Stage:** 5 · Timers · **Level:** Intermediate · **Topic:** Effects & timers · **File:** `TrafficLight.jsx` · ★ Interview problem

**Builds on:** `setTimeout` cleanup (14) and interval bugs (15).  
**New here:** a chain of timers with different durations, driven by state.

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
npm run check 16
```

<details><summary>Hint</summary>

Since each light has a different duration, a single `setInterval` is awkward.
Use a `setTimeout` inside a `useEffect` that depends on the current light: when
it fires, move to the next light, which re-runs the effect and schedules the
next timeout. Return `() => clearTimeout(id)` from the effect.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
- [Lifecycle of reactive effects](https://react.dev/learn/lifecycle-of-reactive-effects)
- [`useEffect` reference](https://react.dev/reference/react/useEffect)
- [Queueing a series of state updates](https://react.dev/learn/queueing-a-series-of-state-updates)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** move through a fixed sequence of states, each lasting a different length of time.

**Key concepts**

- **Let state drive the timer.** The current colour is state. An effect that depends on it schedules the *next* change. When the timeout fires and changes the colour, the component re-renders, the effect's dependency has changed, and the effect runs again for the new colour. The loop is: state → effect → timeout → state.
- **`setTimeout` fits better than `setInterval`.** An interval has one fixed period, but the three lights have three durations. A fresh timeout per light reads the right duration each time.
- **Cleanup makes it safe.** Every run of the effect is paired with a `clearTimeout`, so there is never more than one timer, and none after unmount.

**How the solution works**

```js
useEffect(() => {
  const id = setTimeout(() => {
    setActive(cur => ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length]);
  }, durations[active]);
  return () => clearTimeout(id);
}, [active, durations]);
```

The modulo wraps yellow back to red. The updater form means the callback does not depend on the closed-over `active`.

**A subtlety with `durations`**

It is a dependency, compared by reference. The default is a module-level constant, so it is stable. A caller writing `durations={{ red: 100, ... }}` inline would pass a new object on every render and restart the current light's timer each time. The caller should hoist or memoize it. This is a good thing to point out unprompted.

**Common mistakes**

Using `setInterval` and trying to change its period, forgetting the cleanup (timers stack on every render), or keeping an index in a ref so that the UI never updates.

**Extensions interviewers ask for**

A pedestrian button that forces red, a countdown display, or pausing. All are easier if the logic is modelled as "current state plus a rule for the next one", which is the idea behind a state machine.
</details>
