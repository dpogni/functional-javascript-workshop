# 18 · useInterval with pause

**Stage:** 5 · Timers · **Level:** Intermediate · **Topic:** Custom hooks · **File:** `useInterval.js` · ★ Interview problem

**Builds on:** `usePrevious` (12: a ref holding the latest value) and the interval bug hunt (15).  
**New here:** the "latest callback in a ref" pattern, so the timer never needs restarting when the callback changes.

A declarative `setInterval`. The usual failure points are cleanup and stale
callbacks: the same traps as the traffic light, in reusable form.

## Requirements

`export default function useInterval(callback, delay)`

- Calls `callback` every `delay` ms.
- `delay === null` means **paused**: no timer is running at all.
  Switching back to a number resumes ticking.
- Always calls the **latest** `callback` passed in, even if the component
  re-rendered with a new function, **without** restarting the timer. A new
  callback on every render must not delay the next tick.
- Changing `delay` restarts the interval with the new delay.
- Never more than one active timer; unmounting leaves **zero** timers.
- Returns nothing.

## Check it

```bash
npm run check 18
```

<details><summary>Hint</summary>

Store the callback in a ref and update it on every render (or in an effect).
Then set up the interval in a separate effect that depends **only** on
`delay`, and have it call `savedCallback.current()`. See Dan Abramov's
"Making setInterval Declarative with React Hooks".
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Separating events from effects](https://react.dev/learn/separating-events-from-effects)
- [Removing effect dependencies](https://react.dev/learn/removing-effect-dependencies)
- [Referencing values with refs](https://react.dev/learn/referencing-values-with-refs)
- [Reusing logic with custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Lifecycle of reactive effects](https://react.dev/learn/lifecycle-of-reactive-effects)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** `setInterval` wants one callback for ever; React gives you a new callback on every render. Reconcile the two.

**The tension**

- If the callback is an effect dependency, the interval is cleared and recreated on every render. A component that re-renders every 100 ms would never let a 1000 ms interval fire.
- If the callback is left out of the dependencies, the interval keeps calling the function from the first render: a stale closure, as in exercise 15.

**The pattern: latest callback in a ref**

Split the hook into two concerns with two effects.

```js
const saved = useRef(callback);
useLayoutEffect(() => { saved.current = callback; });      // every render

useEffect(() => {
  if (delay === null) return;
  const id = setInterval(() => saved.current(), delay);
  return () => clearInterval(id);
}, [delay]);                                               // only when delay changes
```

The interval's own function never changes: it is a tiny wrapper that looks up whatever is in the box at the moment it fires. The first effect keeps the box current. So the timer is set up once per `delay`, yet always runs the newest callback.

**Pausing**

`delay === null` returns before starting a timer. Going from a number to `null` runs the cleanup and starts nothing; going back starts a new interval. The caller writes `useInterval(tick, running ? 1000 : null)`, which reads as a description, not as start/stop commands. That is what "declarative" means here.

**Why update the ref in an effect and not during render?**

Writing a ref during render makes rendering impure. `useLayoutEffect` runs after commit but before any timer could fire, so the box is never out of date.

**The general lesson**

Separate what should *restart* the effect (reactive: `delay`) from what the effect should merely *read the latest of* (non-reactive: `callback`). React's `useEffectEvent` exists to express exactly this split. In an interview, name the source: Dan Abramov's "Making setInterval Declarative with React Hooks".
</details>
