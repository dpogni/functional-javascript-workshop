# 03 · List state: shopping list

**Stage:** 1 · State & props · **Level:** Warm-up · **Topic:** Arrays in state, keys & form submit · **File:** `ShoppingList.jsx`

**Builds on:** controlled inputs from 02.  
**New here:** an *array* in state, updated **immutably** (no `push`/`splice`),
rendering it with stable `key`s, and handling a `<form>` submit.

## Requirements

`export default function ShoppingList({ initialItems = [] })`
where `initialItems` is an array of strings, e.g. `['Milk', 'Eggs']`.

- A `<form>` with a text input labelled **New item** and an **Add** button.
- Submitting the form (clicking **Add** *or* pressing Enter in the input) adds
  the **trimmed** text to the end of the list and clears the input.
- Blank input (empty or only spaces) adds nothing.
- The page must not reload on submit.
- Each item is an `<li>` showing its text and a button with
  `aria-label="Remove <text>"`.
- Removing an item removes **only that one**, even when two items have the same
  text (so you can't identify items by text alone).
- `data-testid="count"` shows `0 items`, `1 item`, `2 items`...
- When the list is empty, show the text `Nothing to buy yet`.

## Check it

```bash
npm run check 3
```

<details><summary>Hint</summary>

Store objects, not bare strings: `{ id, text }`. Generate ids with a counter
in a `useRef` or `crypto.randomUUID()`. Add with `setItems(prev => [...prev, item])`,
remove with `setItems(prev => prev.filter(i => i.id !== id))`, and use
`key={item.id}` (not the array index). In `onSubmit`, call `e.preventDefault()`.
</details>
