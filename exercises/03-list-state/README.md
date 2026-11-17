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

<details><summary>Topics to read (official React docs)</summary>

- [Updating arrays in state](https://react.dev/learn/updating-arrays-in-state)
- [Rendering lists (and why keys matter)](https://react.dev/learn/rendering-lists)
- [`<form>` reference](https://react.dev/reference/react-dom/components/form)
- [Choosing the state structure (avoid redundant state)](https://react.dev/learn/choosing-the-state-structure)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** keep an array in state, change it without mutating it, and render it with keys that identify each item.

**Key concepts**

- **Immutable updates.** React decides whether to re-render by comparing the new state with the old one by reference. `items.push(x); setItems(items)` hands React the *same* array, so it may skip the render, and it also corrupts the previous snapshot. Create a new array instead: `[...prev, item]` to add, `prev.filter(...)` to remove, `prev.map(...)` to change one.
- **Keys are identity.** A `key` tells React which element in the new list corresponds to which element in the old one. Array indexes shift when you remove an item, so state inside rows can end up attached to the wrong row. Text is not unique (two "Milk" entries). Hence each item gets an `id` that never changes.
- **Forms submit.** Wrapping the input in a `<form>` gives you Enter-to-submit for free. The browser's default is to reload the page, so the handler calls `e.preventDefault()`.

**How the solution works**

Items are stored as `{ id, text }`. A `useRef` counter hands out ids: it survives re-renders, and changing it does not cause one. There are two pieces of state: the list and the draft text. Submit trims the draft, ignores it if empty, appends, and clears the draft. Remove filters by `id`, which is why removing one of two identical items works. The count and the empty-state message are derived from `items.length`.

**Common mistakes**

`key={index}`, removing by text, mutating with `push`/`splice`, and putting the add logic on the button's `onClick` (which breaks Enter).
</details>
