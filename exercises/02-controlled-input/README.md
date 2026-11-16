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
