import { render, screen, fireEvent } from '@testing-library/react';
import ProductSearch from '@ex/06-use-memo/ProductSearch.jsx';
import { getFilterCalls, resetFilterCalls } from '@ex/06-use-memo/slowFilter.js';

const PRODUCTS = ['Apple', 'Apricot', 'Banana', 'Cherry'];
const names = () => screen.queryAllByRole('listitem').map((li) => li.textContent);
const search = () => screen.getByLabelText(/search/i);
const compact = () => screen.getByLabelText(/compact view/i);

beforeEach(() => resetFilterCalls());

describe('06 · useMemo: don\'t redo expensive work', () => {
  test('shows every product initially (using slowFilter)', () => {
    render(<ProductSearch products={PRODUCTS} />);
    expect(names()).toEqual(PRODUCTS);
    expect(screen.getByTestId('count')).toHaveTextContent('4 results');
    expect(getFilterCalls()).toBe(1);
  });

  test('typing filters the list', () => {
    render(<ProductSearch products={PRODUCTS} />);
    fireEvent.change(search(), { target: { value: 'ap' } });
    expect(names()).toEqual(['Apple', 'Apricot']);
    expect(screen.getByTestId('count')).toHaveTextContent('2 results');
  });

  test('Compact view still toggles', () => {
    render(<ProductSearch products={PRODUCTS} />);
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-compact', 'false');
    fireEvent.click(compact());
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-compact', 'true');
  });

  test('toggling Compact view does not re-run slowFilter', () => {
    render(<ProductSearch products={PRODUCTS} />);
    resetFilterCalls();
    fireEvent.click(compact());
    fireEvent.click(compact());
    fireEvent.click(compact());
    expect(getFilterCalls()).toBe(0);
  });

  test('each query change runs slowFilter exactly once', () => {
    render(<ProductSearch products={PRODUCTS} />);
    resetFilterCalls();
    fireEvent.change(search(), { target: { value: 'b' } });
    expect(getFilterCalls()).toBe(1);
    fireEvent.click(compact());
    fireEvent.change(search(), { target: { value: 'ba' } });
    expect(getFilterCalls()).toBe(2);
    expect(names()).toEqual(['Banana']);
  });

  test('a new products array recomputes the results (no stale cache)', () => {
    const { rerender } = render(<ProductSearch products={PRODUCTS} />);
    fireEvent.change(search(), { target: { value: 'a' } });
    rerender(<ProductSearch products={['Avocado', 'Kiwi', 'Papaya']} />);
    expect(names()).toEqual(['Avocado', 'Papaya']);
  });

  test('re-rendering with the same props does not re-run slowFilter', () => {
    const { rerender } = render(<ProductSearch products={PRODUCTS} />);
    resetFilterCalls();
    rerender(<ProductSearch products={PRODUCTS} />);
    expect(getFilterCalls()).toBe(0);
  });
});
