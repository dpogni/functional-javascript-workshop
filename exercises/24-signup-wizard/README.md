# 24 · Multi-step signup form with useReducer

**Stage:** 7 · Reducers & forms · **Level:** Advanced · **Topic:** State machines & forms · **File:** `SignupWizard.jsx` · ★ Interview problem

**Builds on:** `useReducer` (22) and field validation (23).  
**New here:** a reducer as a small *state machine* (steps with guarded transitions).

Account info → profile → review. Each step must be valid before **Next** is
clickable, and going **Back** must never lose anything already typed.

## Requirements

`SignupWizard.jsx` must export:

### `initialState`
```js
{
  step: 1,                                                   // 1, 2 or 3
  values: { email: '', password: '', fullName: '', username: '' },
  submitted: false,
}
```

### `wizardReducer(state, action)`: a pure reducer handling:
| action | effect |
| --- | --- |
| `{ type: 'CHANGE', field, value }` | set `values[field] = value` (immutably) |
| `{ type: 'NEXT' }` | go to the next step **only if** the current step is valid and `step < 3` |
| `{ type: 'BACK' }` | go to the previous step if `step > 1` (values untouched) |
| `{ type: 'SUBMIT' }` | set `submitted: true` **only if** on step 3 and everything is valid |
| anything else | return `state` unchanged (same reference) |

Never mutate `state`. Return a new object whenever something changes.

### Validation rules
- **email**: looks like `something@something.tld` (no spaces)
- **password**: at least 8 characters
- **fullName**: not empty after trimming
- **username**: 3–16 characters, only letters, digits, or `_`

### `default function SignupWizard({ onSubmit })`: the UI, built on `useReducer(wizardReducer, initialState)`
- Shows `Step N of 3` and an `<h2>` heading: **Account**, **Profile**, **Review**.
- Step 1 inputs labelled **Email** and **Password** (`type="password"`).
- Step 2 inputs labelled **Full name** and **Username**.
- Step 3 shows the email, full name and username for review. It must **not**
  show the password in plain text.
- A **Next** button on steps 1–2 that is `disabled` while the step is invalid.
- A **Back** button on steps 2–3 (not on step 1).
- A **Submit** button on step 3. Clicking it calls `onSubmit(values)` exactly
  once and then shows `Thanks for signing up, <fullName>!` in place of the form.
- Use `<label htmlFor>` / `id` (or wrap the input in the label) so labels are
  connected to their inputs.

## Check it

```bash
npm run check 24
```

<details><summary>Hint</summary>

Write a `validateStep(step, values)` helper that returns `true`/`false`; use it
both in the reducer (to guard `NEXT`/`SUBMIT`) and in the component (to
disable **Next**). Keep *all* form values in one `values` object in the
reducer state so unmounting a step's inputs never loses data.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Extracting state logic into a reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [`useReducer` reference](https://react.dev/reference/react/useReducer)
- [Choosing the state structure (avoid redundant state)](https://react.dev/learn/choosing-the-state-structure)
- [Preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state)
- [Scaling up with reducer and context](https://react.dev/learn/scaling-up-with-reducer-and-context)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** a form spread over several screens, where you may only move forward when the current screen is valid and nothing is lost when you move back.

**Model it as a state machine**

There are four situations: step 1, step 2, step 3, submitted. There are a few allowed moves between them, each with a condition:

- `NEXT`: step n → n + 1, only if step n's fields are valid and n < 3.
- `BACK`: step n → n − 1, only if n > 1.
- `SUBMIT`: step 3 → submitted, only if everything is valid.
- `CHANGE`: stays on the same step, updates one field.

A reducer is a natural home for this. Each `case` is one transition and its guard. An illegal move returns the current state unchanged, so the UI cannot reach an invalid step even if a button is wired up wrongly.

**Why going back loses nothing**

All four field values live in one `values` object in the reducer state, above the step components. A step's inputs unmount when you leave it, but they were only ever *displaying* that state. If each step kept its own `useState`, unmounting would destroy it. This is "lifting state up" (exercise 04) applied to a form.

**One validation function, used twice**

`validateStep(step, values)` is called in the reducer, to guard `NEXT` and `SUBMIT`, and in the component, to disable the Next button. The button is a convenience for the user; the reducer is the actual rule. Keeping one function means the two can never disagree.

**How the solution works**

`STEP_FIELDS` maps each step to its field names; a `validators` table maps each field to a predicate. `validateStep` checks every field of a step. The component renders by `step`, with a small `Field` component that dispatches `CHANGE`. The review step shows the values and masks the password. Submitting dispatches `SUBMIT` and calls `onSubmit(values)` from the click handler, because calling a parent callback is a side effect and reducers must stay pure.

**What an interviewer is looking for**

That you design the state shape and the transitions before writing JSX, keep validation in one place, keep side effects out of the reducer, and can say how it would grow: per-field error messages (exercise 23), an async "is this username taken" check, or saving a draft.
</details>
