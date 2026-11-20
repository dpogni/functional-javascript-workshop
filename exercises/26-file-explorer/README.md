# 26 · File explorer: a recursive tree

**Stage:** 8 · Interview classics · **Level:** Intermediate · **Topic:** Recursive components · **File:** `FileExplorer.jsx` · ★ Interview problem

**Builds on:** rendering lists (03), lifting state up (04), the accordion's open/closed state (04).  
**New here:** a component that renders *itself* for nested data, and the
question of where expand/collapse state should live when parts of the tree
unmount.

Also asked as "nested comments" or "folder structure". Same problem, same answer.

## Requirements

`export default function FileExplorer({ tree })`

`tree` is an array of nodes. A node is `{ name }` for a file, or
`{ name, children: [...] }` for a folder (an empty `children` array is an empty
folder). Folders nest to any depth. Names are unique within a folder.

**Markup**
- The top level is a list with the accessible name **Files**
  (`<ul aria-label="Files">`). Each node is an `<li>`, and an expanded folder's
  contents are a nested `<ul>` inside that folder's `<li>`.
- A folder is a `<button>` whose accessible name is exactly the folder name,
  with `aria-expanded="true"` or `"false"`. Icons are welcome, but mark them
  `aria-hidden="true"` so they aren't part of the name.
- A file is plain text, not a button.

**Behaviour**
- All folders start collapsed: only the top level is visible.
- Clicking a folder expands it; clicking again collapses it.
- An expanded empty folder shows the text `(empty)`.
- In every folder, **folders come first, then files**, each group sorted by name,
  ignoring case (`README.md` sorts between `package.json` and `src.js`).
- Collapsing a folder and expanding it again **restores** the open/closed state
  of the folders inside it.
- `tree` is never modified (it may be frozen).

## Check it

```bash
npm run check 26
```

<details><summary>Hint</summary>

Write a `Node` component that renders one node and, for an expanded folder,
maps over its children rendering `<Node>` again: that's the recursion. Sort a
*copy* of each children array: `[...nodes].sort(...)`.

For the "restores" requirement, think about what happens to a child's
`useState` when its parent folder collapses and the child unmounts. Keep the set
of expanded folder paths (`'src/components'`) in **one** `useState(new Set())`
at the top instead.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Rendering lists (and why keys matter)](https://react.dev/learn/rendering-lists)
- [Preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state)
- [Sharing state between components](https://react.dev/learn/sharing-state-between-components)
- [Updating objects in state](https://react.dev/learn/updating-objects-in-state)
- [Conditional rendering](https://react.dev/learn/conditional-rendering)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** render data of unknown depth, and remember which
parts are open.

**Recursion in React is just a component that renders itself**

```jsx
function Node({ node, path, expanded, toggle }) {
  if (!node.children) return <li>{node.name}</li>;
  const open = expanded.has(path);
  return (
    <li>
      <button aria-expanded={open} onClick={() => toggle(path)}>{node.name}</button>
      {open && (
        <ul>
          {sortNodes(node.children).map((child) => (
            <Node key={child.name} node={child} path={`${path}/${child.name}`} ... />
          ))}
        </ul>
      )}
    </li>
  );
}
```

The base case is a file (no `children`). A folder renders a list of `Node`s. The
data decides how deep it goes; there's no loop over levels.

**Where should "is this folder open" live?**

The obvious version gives each folder `const [open, setOpen] = useState(false)`.
It works until you collapse a parent: its children leave the tree, React
**destroys their state**, and on re-expanding every subfolder is closed again.
React keeps state only while the component stays at the same position in the
tree.

Two ways out:
1. **Lift the state** (the solution): one `Set` of expanded paths at the top.
   Unmounting a folder no longer matters, because it was only displaying state
   it didn't own. A bonus is that "collapse all" or "expand to this file"
   become one-line state changes.
2. **Keep children mounted but hidden** (`hidden={!open}`): state survives
   because nothing unmounts. It's simpler, but renders the whole tree up front,
   which can be slow for large trees.

**Paths as ids**

A name alone isn't unique (two folders can both contain `utils`), but the path
from the root is. Within one folder the name *is* unique, so it's a good `key`.

**Updating a Set immutably**

```js
setExpanded((prev) => {
  const next = new Set(prev);
  next.has(path) ? next.delete(path) : next.add(path);
  return next;
});
```

Mutating `prev` and returning it would hand React the same object, and it could
skip the render (exercise 03's lesson, with a Set instead of an array).

**Sorting without mutating**

`Array.prototype.sort` sorts in place. `tree` is a prop; sorting it directly
mutates the parent's data (the grader freezes it, so that would throw). Copy
first. The comparator checks "is folder" first, then
`a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })` for
case-insensitive order.

**Common follow-ups**

Add, rename or delete nodes (immutable updates on a tree: copy along the path
to the changed node); search that auto-expands matching folders; lazy-loading
children; keyboard navigation with `role="tree"` / `role="treeitem"`.
</details>
