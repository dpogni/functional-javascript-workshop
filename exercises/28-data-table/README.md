# 28 · Data table: sort, filter, paginate

**Stage:** 8 · Interview classics · **Level:** Intermediate · **Topic:** Derived data pipelines · **File:** `DataTable.jsx` · ★ Interview problem

**Builds on:** derived values (02), `useMemo` (06), immutable arrays (03).  
**New here:** chaining several derived steps (filter → sort → page) off a
small amount of state, and keeping that state consistent when the data under it
changes.

Probably the most common "build a real component" question: every product has a
table like this.

## Requirements

`export default function DataTable({ columns, rows, pageSize = 5 })`

- `columns`: `[{ key: 'name', label: 'Name' }, ...]`, in display order.
- `rows`: `[{ id, name: 'Ada', role: 'Engineer', age: 36 }, ...]`. Values are
  strings or numbers. `rows` must never be modified (it may be frozen).

**Markup**
- A `<table>` with a `<thead>` and a `<tbody>`.
- Each column header (`<th>`) contains a `<button>` whose name starts with the
  column's label (decorative sort arrows are fine; mark them `aria-hidden`).
- Each `<th>` has `aria-sort`: `"ascending"` or `"descending"` on the sorted
  column, `"none"` on the others.
- A text input labelled **Filter**.
- **Previous** and **Next** buttons, and an element with
  `data-testid="page-info"` showing `Page 2 of 3`.

**Behaviour**
- Initially: rows in their original order, page 1, no column sorted.
- **Sorting:** clicking a header sorts by that column ascending; clicking the
  same header again toggles descending/ascending. Clicking another header sorts
  by it, ascending. Numbers sort numerically (9 before 10), strings
  alphabetically ignoring case.
- **Filtering:** keeps rows where **any** column's value contains the filter
  text, ignoring case (numbers are matched as text, so `3` matches 36).
- **Paging:** show `pageSize` rows per page. Previous is disabled on the first
  page, Next on the last. With no rows the info reads `Page 1 of 1`.
- Changing the filter or the sort goes back to **page 1**.
- When nothing matches, the body shows a single row with the text
  `No matching rows`.
- If the `rows` prop changes, the table shows the new rows.

## Check it

```bash
npm run check 28
```

<details><summary>Hint</summary>

State is only `query`, `sort` (`{ key, direction }` or `null`) and `page`.
Everything else is computed each render, in this order:

```js
const filtered = rows.filter(...);
const sorted = sort ? [...filtered].sort(compare) : filtered;
const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
const visible = sorted.slice((page - 1) * pageSize, page * pageSize);
```
Reset `page` to 1 in the filter and sort *event handlers*, not in an effect.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Choosing the state structure (avoid redundant state)](https://react.dev/learn/choosing-the-state-structure)
- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
- [`useMemo` reference](https://react.dev/reference/react/useMemo)
- [Updating arrays in state](https://react.dev/learn/updating-arrays-in-state)
- [Rendering lists (and why keys matter)](https://react.dev/learn/rendering-lists)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** three independent controls change how one list is
shown; keep the list itself untouched and compute the view.

**Minimal state, derived view**

The tempting design keeps `displayedRows` in state and updates it from every
handler: filter, then re-sort, then slice. Every handler must then remember
every other step, and a new `rows` prop is ignored because state was copied
from it once. Instead, store only the user's *choices* and derive the rest:

| state | derived each render |
| --- | --- |
| `query` | `filtered` = rows matching the query |
| `sort` | `sorted` = a sorted copy of `filtered` |
| `page` | `pageCount`, `visible` = one slice of `sorted` |

Because `rows` is read fresh every render, a new prop just works.

**Order matters**

Filter → sort → paginate. Paginating before filtering would filter only the
current page; sorting after paginating would sort only five rows.

**Sorting correctly**

- `Array.prototype.sort` sorts *in place*: `rows.sort(...)` would mutate the
  parent's array (the grader freezes it to catch that). Copy first: `[...filtered]`.
- The default comparator compares strings, so `[10, 9, 100].sort()` gives
  `[10, 100, 9]`. Compare numbers with `a - b` and strings with
  `a.localeCompare(b, undefined, { sensitivity: 'base' })`.
- For descending, negate the result instead of writing a second comparator.

**Resetting the page**

After filtering, page 3 may not exist any more. Setting `page` back to 1 *in the
same event handler* that changes the query makes both updates land in one
render. The effect version (`useEffect(() => setPage(1), [query])`) renders
once with an out-of-range page and then again, and is exactly what the docs'
"You might not need an effect" page warns against. As a safety net, clamp:
`const current = Math.min(page, pageCount)`, which also covers a shrinking
`rows` prop.

**Performance**

For a few hundred rows, recomputing on every render is fine. For thousands,
wrap `filtered` and `sorted` in `useMemo` keyed on `[rows, query]` and
`[filtered, sort]`, so that paging doesn't re-sort. Beyond that, filtering
and sorting usually move to the server, and the table renders one page at a time.

**Accessibility**

`aria-sort` on the `<th>` (not the button) tells screen readers how the table
is ordered. Sort controls are real buttons, so they work from the keyboard.

**Common follow-ups**

A third click that removes sorting; multi-column sort; per-column filters;
selectable rows with "select all on this page"; moving the logic into a
`useTable(rows, options)` custom hook so the markup can vary.
</details>
