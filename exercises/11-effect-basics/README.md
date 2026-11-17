# 11 · useEffect with cleanup: useDocumentTitle

**Stage:** 3 · Refs, effects & custom hooks · **Level:** Warm-up · **Topic:** Effects, dependencies & cleanup · **File:** `useDocumentTitle.js`

**Builds on:** mount effect (09) and custom hooks (10).  
**New here:** the full effect lifecycle, with nothing else in the way:
1. the effect runs after render,
2. the **dependency array** decides when it re-runs,
3. the **cleanup function** undoes it.

Every timer exercise in stage 5 is this same pattern with `setTimeout` in
place of `document.title`.

## Requirements

`export default function useDocumentTitle(title)`

- Sets `document.title` to `title` after the component mounts.
- Updates `document.title` whenever `title` changes.
- When the component **unmounts**, restores `document.title` to whatever it was
  **before the hook first ran** (not to an intermediate title).
- Does not write to `document.title` on re-renders where `title` is unchanged.
- Returns nothing.

## Check it

```bash
npm run check 11
```

<details><summary>Hint</summary>

Two effects keep it simple:

```js
// 1. sync: re-runs whenever `title` changes
useEffect(() => { document.title = title; }, [title]);

// 2. restore: [] means "set up on mount, clean up on unmount"
useEffect(() => {
  const original = document.title;
  return () => { document.title = original; };
}, []);
```
Order matters: effects run top to bottom, so declare the "restore" effect
**first**, so it captures the title before the "sync" effect overwrites it.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
- [Lifecycle of reactive effects](https://react.dev/learn/lifecycle-of-reactive-effects)
- [`useEffect` reference](https://react.dev/reference/react/useEffect)
- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** keep something *outside* React (the browser tab title) in step with a value inside React, and undo it when the component goes away.

**Key concepts**

- **What effects are for.** Rendering must be pure: it computes JSX and touches nothing else. Writing `document.title` is a side effect on an external system, so it goes in `useEffect`, which runs after React has committed.
- **The dependency array controls when it re-runs.** No array: after every render. `[]`: once, after mount. `[title]`: after mount, and again whenever `title` differs from last time.
- **Cleanup mirrors setup.** The function you return runs before the effect runs again, and once more on unmount. Think of each effect as a pair: start synchronising / stop synchronising.

**How the solution works**

Two effects, each with one job. The first has `[]`: on mount it remembers the current `document.title`, and its cleanup (on unmount) puts it back. The second has `[title]` and writes the new title.

Order matters. Effects run in the order they are declared, so the "remember" effect is first; otherwise it would capture the title the hook had just written.

**The one-effect version also works**

`useEffect(() => { const prev = document.title; document.title = title; return () => { document.title = prev; }; }, [title])`. Each cleanup restores the previous value before the next setup runs, so the chain unwinds to the original. The two-effect version states the intent more directly.

**Why this exercise matters**

Every timer exercise that follows has this exact shape, with `setTimeout`/`clearTimeout` in place of write/restore. In development, Strict Mode runs setup → cleanup → setup once on mount to expose effects whose cleanup does not fully undo the setup.
</details>
