# 08 · Bug hunt: auto-counter stuck at 1

**Level:** Beginner · **Topic:** Debugging · **File:** `AutoCounter.jsx`

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
npm run check 8
```

<details><summary>Hint</summary>

- The interval callback was created during the first render, so `count` inside
  it is forever `0`. Fix: functional update `setCount(c => c + 1)`.
- The effect never returns a cleanup → leaked intervals.
- The dependency array is `[]`, so the effect never reacts to `running` or
  `interval` changing.
</details>
