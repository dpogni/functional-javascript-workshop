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

<details><summary>Topics to read (official React docs)</summary>

- [Extracting state logic into a reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [`useReducer` reference](https://react.dev/reference/react/useReducer)
- [Updating arrays in state](https://react.dev/learn/updating-arrays-in-state)
- [Updating objects in state](https://react.dev/learn/updating-objects-in-state)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** several different actions change the same state; put all the rules for how in one function.

**Key concepts**

- **A reducer is `(state, action) => newState`.** It takes the current state and a description of what happened, and returns the next state. It must be pure: no mutation, no side effects, same inputs give the same output.
- **Components dispatch, reducers decide.** A click handler says `dispatch({ type: 'ADD', product })`. It does not know how a cart works. All the cart logic is in one place, readable from top to bottom.
- **Actions describe events, not setters.** `ADD` and `DECREMENT` name what the user did. An action like `SET_ITEMS` would push the logic back into the component.
- **Immutability, as with `useState`.** Return new arrays and objects. React compares by reference, and the previous state must stay intact.

**How the solution works**

- `ADD`: if the product is already in the cart, `map` and return a copy of that item with `qty + 1`; otherwise append `{ ...product, qty: 1 }`.
- `DECREMENT`: `map` to lower the quantity, then `filter(i => i.qty > 0)`. "Remove at zero" needs no special case.
- `CLEAR`: return `initialCart`.
- `default`: return `state` itself. Returning the same reference tells React nothing changed.

`cartTotal` is a plain function of the state. The total is derived, never stored.

**`useState` or `useReducer`?**

Reach for a reducer when one event updates several fields together, when the next state depends on the previous one in non-trivial ways, or when the handlers in a component have grown into a list of `setX(prev => ...)` calls. For one or two independent values, `useState` is simpler.

**Why interviewers like reducers**

They are testable without React: the grader calls `cartReducer` directly with frozen objects. Freezing makes any accidental mutation throw, which is a quick way to prove a reducer is pure.
</details>
