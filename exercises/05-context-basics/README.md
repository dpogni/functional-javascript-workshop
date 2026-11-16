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
