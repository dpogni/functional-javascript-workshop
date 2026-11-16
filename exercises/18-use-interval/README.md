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
