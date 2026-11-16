import { useReducer } from 'react';

export const initialCart = { items: [] };

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product } = action;
      const exists = state.items.some((i) => i.id === product.id);
      return {
        ...state,
        items: exists
          ? state.items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
          : [...state.items, { ...product, qty: 1 }],
      };
    }
    case 'DECREMENT':
      return {
        ...state,
        items: state.items
          .map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
          .filter((i) => i.qty > 0),
      };
    case 'CLEAR':
      return initialCart;
    default:
      return state;
  }
}

export function cartTotal(state) {
  return state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export default function Cart({ products }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  return (
    <div>
      <div>
        {products.map((product) => (
          <button key={product.id} onClick={() => dispatch({ type: 'ADD', product })}>
            Add {product.name}
          </button>
        ))}
      </div>

      {cart.items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul>
          {cart.items.map((item) => (
            <li key={item.id}>
              <span data-testid={`line-${item.id}`}>
                {item.name} × {item.qty}
              </span>{' '}
              <button
                aria-label={`Decrease ${item.name}`}
                onClick={() => dispatch({ type: 'DECREMENT', id: item.id })}
              >
                −
              </button>
            </li>
          ))}
        </ul>
      )}

      <p>
        Total: <span data-testid="total">${cartTotal(cart).toFixed(2)}</span>
      </p>
      <button onClick={() => dispatch({ type: 'CLEAR' })} disabled={cart.items.length === 0}>
        Clear cart
      </button>
    </div>
  );
}
