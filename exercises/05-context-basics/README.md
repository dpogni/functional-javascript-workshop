# 05 · Context basics: current user

**Stage:** 2 · Context & memoization · **Level:** Warm-up · **Topic:** `createContext` / `useContext` · **File:** `user.jsx`

**Builds on:** passing props down (04).  
**New here:** Context lets a deeply nested component read a value **without**
every component in between passing it along ("prop drilling"). This exercise is
read-only context: no state, no memoization. Those come in 08.

## Requirements

`user.jsx` must export **three named exports**:

### `UserProvider({ user, children })`
- Makes `user` (an object like `{ name: 'Ada' }`, or `null`) available to
  everything rendered inside it.

### `useUser()`
- Returns the `user` from the nearest `UserProvider` above.
- Returns `null` when there is no provider at all.

### `UserBadge()`
- Takes **no props**. Reads the user from context.
- Renders `Signed in as <name>` when there is a user, otherwise `Not signed in`.

Behaviour the grader checks:
- A `UserBadge` nested several components deep still sees the user.
- When the `user` prop on the provider changes, consumers update.
- With nested providers, the **nearest** one wins.

## Check it

```bash
npm run check 5
```

<details><summary>Hint</summary>

Three steps: `const UserContext = createContext(null)` (the argument is the
value used when there's no provider), render
`<UserContext.Provider value={user}>{children}</UserContext.Provider>`, and
read it with `useContext(UserContext)`.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Passing data deeply with context](https://react.dev/learn/passing-data-deeply-with-context)
- [`createContext` reference](https://react.dev/reference/react/createContext)
- [`useContext` reference](https://react.dev/reference/react/useContext)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** let a deeply nested component read a value without every component in between passing it along.

**Key concepts**

- **Prop drilling.** Passing `user` through `Layout`, `Header` and `Nav` just so `UserBadge` can use it couples all of them to data they do not care about.
- **Context has three parts.** `createContext(defaultValue)` makes the channel. `<Ctx.Provider value={...}>` (or `<Ctx value={...}>` in React 19) broadcasts a value to everything below it. `useContext(Ctx)` reads the value from the *nearest* provider above.
- **The default value** is only used when there is no provider at all. Here it is `null`, which doubles as "not signed in".
- **Updates propagate.** When the provider's `value` changes, every component that calls `useContext` for that context re-renders, even if components in between did not.

**How the solution works**

The context object stays private to the file. Three small exports wrap it: `UserProvider` renders the provider with `value={user}`, `useUser` is a one-line custom hook around `useContext`, and `UserBadge` calls `useUser()` and renders one of two strings. Nested providers work with no extra code, because lookup always stops at the nearest one.

**Why wrap it in a hook and a provider component?**

Callers never touch the context object, so you can later change what is stored, add state, or add validation (exercise 08 does all three) without changing any consumer.

**When not to use context**

For data only one or two levels away, props are simpler and more explicit. Context suits values many components need: current user, theme, locale.
</details>
