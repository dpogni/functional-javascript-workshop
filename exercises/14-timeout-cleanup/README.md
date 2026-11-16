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
