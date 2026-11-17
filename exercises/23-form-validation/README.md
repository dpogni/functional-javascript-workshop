# 23 · Form validation: login form

**Stage:** 7 · Reducers & forms · **Level:** Intermediate · **Topic:** Validation, touched fields & submit · **File:** `LoginForm.jsx`

**Builds on:** controlled inputs (02), form submit (03), and (optionally) `useReducer` (22).  
**New here:** validating fields, and the UX question of **when** to show an
error: not while the user is still typing their first character, but after they
leave the field ("touched") or try to submit. The signup wizard (24) is three
of these glued together with a step machine.

## Requirements

`export default function LoginForm({ onSubmit })`

**Markup**
- A `<form>` with inputs labelled **Email** and **Password** (`type="password"`)
  and a **Log in** submit button (always enabled).

**Validation rules**
- email must look like `something@something.tld` (no spaces);
  error text: `Enter a valid email`
- password must be at least 8 characters;
  error text: `Password must be at least 8 characters`

**When errors show**
- Nothing is shown initially, and nothing while typing in an untouched field.
- After a field loses focus (**blur**), its error shows if it's invalid.
- Once shown, the error disappears as soon as the value becomes valid.
- Each visible error is an element with `role="alert"`, and the matching input
  has `aria-invalid="true"` (otherwise `"false"` or absent).

**Submitting**
- Submitting with invalid fields shows **all** errors (even for untouched
  fields) and does **not** call `onSubmit`.
- Submitting with valid fields calls `onSubmit({ email, password })` exactly once.
- The page must not reload.

## Check it

```bash
npm run check 23
```

<details><summary>Hint</summary>

State: `values` (`{ email, password }`) and `touched` (`{ email: false, password: false }`).
Errors are **derived**: compute `const errors = validate(values)` every render;
don't store them. Show an error when `touched[field] && errors[field]`.
`onBlur` sets `touched[field] = true`; a failed submit sets both to `true`.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Reacting to input with state](https://react.dev/learn/reacting-to-input-with-state)
- [Choosing the state structure (avoid redundant state)](https://react.dev/learn/choosing-the-state-structure)
- [`<form>` reference](https://react.dev/reference/react-dom/components/form)
- [Updating objects in state](https://react.dev/learn/updating-objects-in-state)
- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** tell users what is wrong with a form, but not before they have had a chance to get it right.

**Key concepts**

- **Errors are derived.** `const errors = validate(values)` runs on every render. Errors are a pure function of the values, so storing them in state would create a second source of truth that can fall out of step. This is the same lesson as exercise 02.
- **Showing an error is a separate question from having one.** An empty form is invalid from the first render, but shouting about it immediately is poor UX. The extra fact you need is whether the user has *visited* the field. That cannot be derived, so it is state: `touched`.
- **Display rule:** show a field's error when `touched[field] && errors[field]`.
- **One handler for all fields.** Giving each input a `name` lets one `onChange` do `setValues(v => ({ ...v, [e.target.name]: e.target.value }))`, and one `onBlur` do the same for `touched`.

**How the solution works**

Two state objects, `values` and `touched`. `onBlur` marks a field touched. On submit: `preventDefault()`; if there are errors, mark *every* field touched (so all errors appear at once) and stop; otherwise call `onSubmit(values)`.

Because errors are recomputed each render, a visible error disappears on the keystroke that makes the value valid. No code "clears" it.

**Accessibility**

`role="alert"` makes screen readers announce the message when it appears. `aria-invalid` marks the input. `noValidate` on the form turns off the browser's own validation bubbles so the two systems do not compete.

**How this connects to the wizard**

Exercise 24 uses a different policy (the Next button is disabled until the step is valid), but the same core: a `validate` function over a `values` object, with validity derived on every render. In production you would likely use a form library; interviewers ask for it by hand to see whether you separate values, validity and visibility.
</details>
