# 22 · useReducer basics: shopping cart

**Stage:** 7 · Reducers & forms · **Level:** Intermediate · **Topic:** `useReducer` · **File:** `Cart.jsx`

**Builds on:** immutable array updates (03).  
**New here:** when several actions change the same state in different ways,
`useReducer` puts all those transitions in one **pure function**:
`(state, action) => newState`. The component just says *what happened*
(`dispatch({ type: 'ADD', ... })`). Because the reducer is a plain function,
the grader tests it directly, without React.

## Requirements

`Cart.jsx` must export:

### `initialCart`
```js
{ items: [] }       // each item: { id, name, price, qty }
```

### `cartReducer(state, action)`: a pure reducer handling:
| action | effect |
| --- | --- |
| `{ type: 'ADD', product }` | `product` is `{ id, name, price }`. If it's already in the cart, its `qty` goes up by 1; otherwise it is appended with `qty: 1` |
| `{ type: 'DECREMENT', id }` | that item's `qty` goes down by 1; at 0 the item is **removed** |
| `{ type: 'CLEAR' }` | back to an empty cart |
| anything else | return `state` unchanged (same reference) |

Never mutate `state` or its items. Return new objects/arrays.

### `cartTotal(state)`
- Returns the sum of `price * qty` as a number.

### `default function Cart({ products })`: the UI, built on `useReducer(cartReducer, initialCart)`
- For each product, a button **Add `<name>`** (e.g. `Add Coffee`).
- For each cart item, an element with `data-testid="line-<id>"` containing
  `<name> × <qty>` (e.g. `Coffee × 2`), plus a button with
  `aria-label="Decrease <name>"`.
- `data-testid="total"` shows the total as `$12.50` (two decimals).
- A **Clear cart** button, `disabled` while the cart is empty.
- When the cart is empty, show `Your cart is empty`.

## Check it

```bash
npm run check 22
```

<details><summary>Hint</summary>

```js
export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const exists = state.items.some((i) => i.id === action.product.id);
      return {
        items: exists
          ? state.items.map((i) => (i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i))
          : [...state.items, { ...action.product, qty: 1 }],
      };
    }
    // ...
    default:
      return state;
  }
}
```
For `DECREMENT`, `map` to lower the qty and then `filter((i) => i.qty > 0)`.
</details>
