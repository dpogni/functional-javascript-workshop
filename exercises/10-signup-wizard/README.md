# 10 · Multi-step signup form with useReducer

**Level:** Advanced · **Topic:** State machines & forms · **File:** `SignupWizard.jsx`

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
npm run check 10
```

<details><summary>Hint</summary>

Write a `validateStep(step, values)` helper that returns `true`/`false`; use it
both in the reducer (to guard `NEXT`/`SUBMIT`) and in the component (to
disable **Next**). Keep *all* form values in one `values` object in the
reducer state so unmounting a step's inputs never loses data.
</details>
