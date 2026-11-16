import { render, screen, fireEvent } from '@testing-library/react';
import Cart, { initialCart, cartReducer, cartTotal } from '@ex/22-reducer-basics/Cart.jsx';

const COFFEE = { id: 'c', name: 'Coffee', price: 3.5 };
const BAGEL = { id: 'b', name: 'Bagel', price: 2.25 };
const PRODUCTS = [COFFEE, BAGEL];

const deepFreeze = (o) => {
  Object.values(o).forEach((v) => v && typeof v === 'object' && deepFreeze(v));
  return Object.freeze(o);
};
const run = (...actions) => actions.reduce((s, a) => cartReducer(deepFreeze(s), a), { items: [] });

describe('22 · useReducer basics: reducer', () => {
  test('initialCart is an empty cart', () => {
    expect(initialCart).toEqual({ items: [] });
  });

  test('ADD appends a new product with qty 1', () => {
    const state = run({ type: 'ADD', product: COFFEE }, { type: 'ADD', product: BAGEL });
    expect(state.items).toEqual([
      { ...COFFEE, qty: 1 },
      { ...BAGEL, qty: 1 },
    ]);
  });

  test('ADD on an existing product increases its qty (no duplicate line)', () => {
    const state = run(
      { type: 'ADD', product: COFFEE },
      { type: 'ADD', product: BAGEL },
      { type: 'ADD', product: COFFEE }
    );
    expect(state.items).toEqual([
      { ...COFFEE, qty: 2 },
      { ...BAGEL, qty: 1 },
    ]);
  });

  test('ADD does not mutate the previous state', () => {
    const before = deepFreeze({ items: [{ ...COFFEE, qty: 1 }] });
    const after = cartReducer(before, { type: 'ADD', product: COFFEE });
    expect(before.items[0].qty).toBe(1);
    expect(after).not.toBe(before);
    expect(after.items).not.toBe(before.items);
  });

  test('DECREMENT lowers qty and removes the item at 0', () => {
    let state = run({ type: 'ADD', product: COFFEE }, { type: 'ADD', product: COFFEE }, { type: 'ADD', product: BAGEL });
    state = cartReducer(deepFreeze(state), { type: 'DECREMENT', id: 'c' });
    expect(state.items).toEqual([
      { ...COFFEE, qty: 1 },
      { ...BAGEL, qty: 1 },
    ]);
    state = cartReducer(deepFreeze(state), { type: 'DECREMENT', id: 'c' });
    expect(state.items).toEqual([{ ...BAGEL, qty: 1 }]);
  });

  test('CLEAR empties the cart', () => {
    const state = run({ type: 'ADD', product: COFFEE }, { type: 'ADD', product: BAGEL }, { type: 'CLEAR' });
    expect(state.items).toEqual([]);
  });

  test('unknown actions return the same state object', () => {
    const state = deepFreeze({ items: [{ ...COFFEE, qty: 1 }] });
    expect(cartReducer(state, { type: 'NOPE' })).toBe(state);
  });

  test('cartTotal sums price × qty', () => {
    expect(cartTotal({ items: [] })).toBe(0);
    const state = run(
      { type: 'ADD', product: COFFEE },
      { type: 'ADD', product: COFFEE },
      { type: 'ADD', product: BAGEL }
    );
    expect(cartTotal(state)).toBeCloseTo(9.25);
  });
});

describe('22 · useReducer basics: UI', () => {
  const add = (name) => fireEvent.click(screen.getByRole('button', { name: `Add ${name}` }));
  const line = (id) => screen.getByTestId(`line-${id}`).textContent.replace(/\s+/g, ' ').trim();
  const total = () => screen.getByTestId('total').textContent.trim();

  test('starts empty', () => {
    render(<Cart products={PRODUCTS} />);
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(total()).toBe('$0.00');
    expect(screen.getByRole('button', { name: 'Clear cart' })).toBeDisabled();
  });

  test('adding products shows lines with quantities and a total', () => {
    render(<Cart products={PRODUCTS} />);
    add('Coffee');
    add('Bagel');
    add('Coffee');
    expect(line('c')).toBe('Coffee × 2');
    expect(line('b')).toBe('Bagel × 1');
    expect(total()).toBe('$9.25');
    expect(screen.queryByText('Your cart is empty')).not.toBeInTheDocument();
  });

  test('Decrease lowers the quantity and removes the line at 0', () => {
    render(<Cart products={PRODUCTS} />);
    add('Coffee');
    add('Coffee');
    fireEvent.click(screen.getByRole('button', { name: 'Decrease Coffee' }));
    expect(line('c')).toBe('Coffee × 1');
    expect(total()).toBe('$3.50');
    fireEvent.click(screen.getByRole('button', { name: 'Decrease Coffee' }));
    expect(screen.queryByTestId('line-c')).not.toBeInTheDocument();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  test('Clear cart empties everything', () => {
    render(<Cart products={PRODUCTS} />);
    add('Coffee');
    add('Bagel');
    fireEvent.click(screen.getByRole('button', { name: 'Clear cart' }));
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(total()).toBe('$0.00');
    expect(screen.getByRole('button', { name: 'Clear cart' })).toBeDisabled();
  });
});
