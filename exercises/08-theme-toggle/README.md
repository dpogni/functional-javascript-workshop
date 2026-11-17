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

<details><summary>Topics to read (official React docs)</summary>

- [Passing data deeply with context](https://react.dev/learn/passing-data-deeply-with-context)
- [`useContext` reference](https://react.dev/reference/react/useContext)
- [`useMemo` reference](https://react.dev/reference/react/useMemo)
- [`useCallback` reference](https://react.dev/reference/react/useCallback)
- [Reusing logic with custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** share a piece of *state* and the function that changes it with a whole subtree, without causing needless re-renders or silent failures.

**Key concepts**

- **Context carrying state.** The provider component owns `useState`. Its context value is an object: `{ theme, toggleTheme }`. Each rendered `ThemeProvider` has its own state, which is why two sibling providers are independent.
- **The value's identity matters.** Every consumer re-renders when the provider's `value` changes by reference. Writing `value={{ theme, toggleTheme }}` inline builds a new object on every render of the provider, so every consumer re-renders even when the theme is the same. `useMemo` keeps the object identical until `theme` actually changes.
- **A stable action.** `toggleTheme` uses an updater (`t => t === 'light' ? 'dark' : 'light'`), so it reads nothing from the render scope and `useCallback(..., [])` can keep one function for the provider's lifetime.
- **Fail loudly.** `createContext(null)` plus a check in `useTheme` turns "forgot the provider" from a confusing `cannot read properties of undefined` somewhere deep in the tree into an immediate, named error.

**How the solution works**

`ThemeProvider` composes three hooks: `useState(initialTheme)`, `useCallback` for the toggle, and `useMemo` for the value object with `[theme, toggleTheme]` as dependencies. `useTheme` reads the context and throws if it is `null`. `ThemeToggle` is an ordinary consumer.

**What an interviewer is looking for**

The provider / custom-hook pattern, the missing-provider guard, and that you can explain why the value is memoized. A common follow-up is "how would you stop components that only need `toggleTheme` from re-rendering when the theme changes?" The answer is two contexts: one for the state, one for the (stable) function.
</details>
