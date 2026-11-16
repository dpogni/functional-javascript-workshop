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
