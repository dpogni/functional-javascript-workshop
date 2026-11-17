# 14 · setTimeout with cleanup: "Saved!" flash

**Stage:** 5 · Timers · **Level:** Warm-up · **Topic:** Timers in effects · **File:** `SaveButton.jsx`

**Builds on:** effect + cleanup (11).  
**New here:** your first timer. The rule for the whole stage: **every timer
you start, you must also clear**: when it's replaced, and when the component
unmounts. The grader uses fake timers, so it can see leaks.

## Requirements

`export default function SaveButton({ duration = 2000 })`

- A **Save** button.
- Clicking it shows a message `Saved!` inside an element with `role="status"`.
- The message disappears `duration` ms after the **most recent** click:
  clicking again while it's visible **restarts** the countdown (it does not
  hide early because of the first click's timer).
- Before the first click, and after it hides, there is no `role="status"`
  element at all.
- Never more than **one** pending timer; unmounting leaves **zero**.

## Check it

```bash
npm run check 14
```

<details><summary>Hint</summary>

One approach: keep a `savedAt` state (e.g. a click counter, `0` = hidden).
An effect that depends on it starts `setTimeout(() => setSavedAt(0), duration)`
whenever it's non-zero and returns `() => clearTimeout(id)`. Because each click
changes `savedAt`, React runs the cleanup (clearing the old timer) and then the
effect again (starting a new one). That *is* the restart.

Another: keep the timer id in a `useRef`, clear + restart it in the click
handler, and add an unmount-only effect that clears it.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
- [Lifecycle of reactive effects](https://react.dev/learn/lifecycle-of-reactive-effects)
- [`useEffect` reference](https://react.dev/reference/react/useEffect)
- [`useRef` reference](https://react.dev/reference/react/useRef)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** show something for a fixed time after the latest click, and never leave a timer behind.

**Key concepts**

- **A timer is an external resource.** Once started, it fires whether or not your component still wants it. If the component has unmounted, the callback touches a dead component; if the user clicked again, the old timer hides the message too early.
- **Start in the effect, stop in the cleanup.** React runs the cleanup before the effect runs again and on unmount, which are exactly the two moments a pending timer must be cancelled.
- **"Restart" falls out of dependencies.** If each click changes a dependency, React runs cleanup (clear the old timer) and then setup (start a new one). You do not write any restart logic.

**How the solution works**

State is a click counter, with `0` meaning hidden. A counter is used instead of a boolean on purpose: clicking while the message is visible would set `true` to `true`, nothing would change, and the effect would not re-run. Incrementing always produces a new value, so the effect restarts.

The effect returns early when the counter is `0`; otherwise it schedules `setSaveCount(0)` after `duration` and returns `() => clearTimeout(id)`.

**The ref alternative**

Keep the timer id in a `useRef`. In the click handler: clear the old id, show the message, start a new timer. Add one effect with `[]` whose cleanup clears the timer on unmount. This is more imperative but equally valid, and useful when the timer is purely a reaction to an event.

**Why the grader counts timers**

"Never more than one pending" catches a missing clear on re-click. "Zero after unmount" catches a missing unmount cleanup. Both bugs are invisible in a quick manual test, which is why interviewers ask about them.
</details>
