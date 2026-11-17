# 15 · Bug hunt: auto-counter stuck at 1

**Stage:** 5 · Timers · **Level:** Beginner · **Topic:** Debugging · **File:** `AutoCounter.jsx` · ★ Interview problem

**Builds on:** functional updates (01), effect cleanup (11), your first timer (14).  
**New here:** `setInterval`, and the stale-closure bug that comes with it.

`AutoCounter.jsx` is supposed to count up once per `interval` ms, with a
Pause/Resume button. Instead the count goes to **1** and stays there. There are
a few more bugs hiding behind that one. Find and fix them all **without
rewriting the component from scratch**. In the interview you'd also be asked to
*explain* each bug, so write a one-line comment next to each fix.

## Expected behaviour

`export default function AutoCounter({ interval = 1000 })`

- Shows the count in `data-testid="count"`, starting at `0`.
- Adds 1 every `interval` ms: 1, 2, 3, 4...
- The button reads **Pause** while running, **Resume** while paused.
- **Pause** stops counting (and leaves no timer running). **Resume** continues
  from where it stopped.
- Never more than one active timer; changing `interval` restarts with the new
  interval; unmounting leaves **zero** timers.

## Check it

```bash
npm run check 15
```

<details><summary>Hint</summary>

- The interval callback was created during the first render, so `count` inside
  it is forever `0`. Fix: functional update `setCount(c => c + 1)`.
- The effect never returns a cleanup → leaked intervals.
- The dependency array is `[]`, so the effect never reacts to `running` or
  `interval` changing.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [State as a snapshot](https://react.dev/learn/state-as-a-snapshot)
- [Queueing a series of state updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- [Lifecycle of reactive effects](https://react.dev/learn/lifecycle-of-reactive-effects)
- [Removing effect dependencies](https://react.dev/learn/removing-effect-dependencies)
- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** an interval created on the first render keeps using that render's variables for ever.

**The three bugs**

1. **Stale closure.** The effect runs once (`[]`). Its interval callback was created in the first render, where `count` is `0`. Every tick computes `0 + 1` and sets the count to `1`. The interval is working; it just keeps writing the same number.
2. **No cleanup.** The interval is never cleared, so it survives unmount, and any re-run of the effect would add a second one.
3. **Dishonest dependencies.** The effect reads `running` and `interval` but lists neither. Pausing changes `running`, but the effect never re-runs, so nothing stops.

**Key concepts**

- **Each render has its own variables.** `count` is not a live reference to "the current count". It is a constant belonging to one render. A function defined in that render captures that constant.
- **Updater functions sidestep the closure.** `setCount(c => c + 1)` asks React for the current value at the time the update is processed, so the callback does not need to read `count` at all.
- **The dependency array is a statement of fact.** It lists what the effect reads. If you find yourself wanting to lie to it, change the effect so it reads less (as the updater does), rather than omitting a dependency.

**How the solution works**

The effect returns early when `running` is false, so pausing means: cleanup clears the interval, setup starts nothing. Otherwise it starts the interval with an updater and returns `() => clearInterval(id)`. Dependencies are `[running, interval]`.

**Why not add `count` to the dependencies?**

It would work, but the interval would be torn down and recreated on every tick, behaving like a chain of timeouts and drifting. The updater keeps one interval alive.

**What an interviewer is looking for**

That you can explain the bug in terms of closures and renders, not only produce the fix. Saying "the callback closed over `count` from the first render" is the sentence they want to hear.
</details>
