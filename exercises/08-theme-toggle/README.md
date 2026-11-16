# 08 · Toggle theme provider

**Stage:** 2 · Context & memoization · **Level:** Beginner · **Topic:** Context & patterns · **File:** `theme.jsx` · ★ Interview problem

**Builds on:** context (05), `useMemo` (06), `useCallback` (07).  
**New here:** combining them: context that holds *state*, a memoized context value, and a custom hook that guards against a missing provider.

Build a light/dark theme with React Context. This shows you understand
providers, consumers, and how to package context behind a custom hook.

## Requirements

`theme.jsx` must export **three named exports**:

### `ThemeProvider({ initialTheme = 'light', children })`
- Holds the current theme (`'light'` or `'dark'`) and provides it via context.
- Every consumer underneath sees the same value and updates together.
- Each provider is independent: two sibling providers have separate themes.
- The context value must be memoized: `toggleTheme` keeps the **same function
  identity** across re-renders of the provider.

### `useTheme()`
- Returns `{ theme, toggleTheme }`.
- Throws an `Error` whose message contains `ThemeProvider` when used outside a
  provider (no silent `undefined`s).

### `ThemeToggle()`
- A `<button>` that calls `toggleTheme`.
- Its text is `Switch to dark mode` while the theme is light, and
  `Switch to light mode` while it is dark.

## Check it

```bash
npm run check 8
```

<details><summary>Hint</summary>

Create the context with `createContext(null)` so `useTheme` can detect a
missing provider. Use `useCallback` for `toggleTheme` (with a functional state
update) and `useMemo` for the `{ theme, toggleTheme }` object.
</details>
