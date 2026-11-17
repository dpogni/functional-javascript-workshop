# 02 · Controlled input: live greeting

**Stage:** 1 · State & props · **Level:** Warm-up · **Topic:** Controlled inputs & derived values · **File:** `Greeting.jsx`

**Builds on:** `useState` from 01.  
**New here:** state that holds a *string* driven by an `<input>`, and values
that are *computed during render* instead of stored in more state.

## Requirements

`export default function Greeting({ maxLength = 20 })`

- A text input labelled **Name** (connect `<label>` and `<input>`). It is a
  *controlled* input: its `value` comes from state.
- An element with `data-testid="greeting"`:
  - `Hello, stranger!` while the name is empty or only spaces,
  - otherwise `Hello, <name>!` using the **trimmed** name.
- An element with `data-testid="chars"` showing `<typed>/<maxLength>`, e.g. `3/20`.
- The input can never hold more than `maxLength` characters.
- A **Clear** button that empties the input. It is `disabled` while the input is empty.

There should be exactly **one** `useState` in your solution. The greeting and
the character count are *derived* from it.

## Check it

```bash
npm run check 2
```

<details><summary>Hint</summary>

`<input value={name} onChange={(e) => setName(e.target.value)} />`.
Compute `const trimmed = name.trim()` in the function body; no effect and no
second piece of state needed. For the limit, either pass `maxLength` to the
input or `slice(0, maxLength)` in the change handler.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Reacting to input with state](https://react.dev/learn/reacting-to-input-with-state)
- [`<input>` reference (controlled inputs)](https://react.dev/reference/react-dom/components/input)
- [Choosing the state structure (avoid redundant state)](https://react.dev/learn/choosing-the-state-structure)
- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** make React, not the DOM, the owner of what's in a text box, and compute everything else from it.

**Key concepts**

- **Controlled input.** An `<input>` with a `value` prop always shows exactly that value. Typing fires `onChange`; unless your handler updates state, the box does not change. The loop is: keystroke → `onChange` → `setName` → re-render → input shows the new `value`.
- **Derived values are not state.** The greeting and the character count can be calculated from `name` during render. Storing them in a second `useState` (or syncing them with an effect) creates two sources of truth that can disagree, plus an extra render. The test for "should this be state?" is: can I compute it from props or other state? If yes, compute it.
- **Transforming input on the way in.** Because every keystroke passes through your handler, you can constrain it there: `e.target.value.slice(0, maxLength)`.

**How the solution works**

One `useState('')` holds the raw text, spaces and all (so the cursor behaves normally while typing). `const trimmed = name.trim()` is computed in the function body, and the JSX uses `trimmed || 'stranger'`. The Clear button sets state to `''` and is disabled when `name === ''`.

**Common mistakes**

Trimming inside `onChange` (you can then never type a space between two words), keeping a `greeting` state updated in a `useEffect`, and forgetting `onChange` so the input appears frozen.
</details>
