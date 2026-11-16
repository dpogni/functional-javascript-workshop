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
