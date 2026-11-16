import { useReducer } from 'react';

// TODO: implement the cart described in README.md

export const initialCart = { items: [] };

export function cartReducer(state, action) {
  return state;
}

export function cartTotal(state) {
  return 0;
}

export default function Cart({ products }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);
  return <div>Cart</div>;
}
