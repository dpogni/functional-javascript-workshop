import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShoppingList from '@ex/03-list-state/ShoppingList.jsx';

const input = () => screen.getByLabelText('New item');
const add = () => screen.getByRole('button', { name: 'Add' });
const count = () => screen.getByTestId('count').textContent.trim().replace(/\s+/g, ' ');
const items = () =>
  screen.queryAllByRole('listitem').map((li) => {
    const clone = li.cloneNode(true);
    clone.querySelectorAll('button').forEach((b) => b.remove());
    return clone.textContent.trim();
  });

describe('03 · List state: shopping list', () => {
  test('starts empty with an empty-state message', () => {
    render(<ShoppingList />);
    expect(items()).toEqual([]);
    expect(count()).toBe('0 items');
    expect(screen.getByText('Nothing to buy yet')).toBeInTheDocument();
  });

  test('renders initialItems', () => {
    render(<ShoppingList initialItems={['Milk', 'Eggs']} />);
    expect(items()).toEqual(['Milk', 'Eggs']);
    expect(count()).toBe('2 items');
    expect(screen.queryByText('Nothing to buy yet')).not.toBeInTheDocument();
  });

  test('Add appends the item and clears the input', async () => {
    const user = userEvent.setup();
    render(<ShoppingList />);
    await user.type(input(), 'Milk');
    await user.click(add());
    expect(items()).toEqual(['Milk']);
    expect(input()).toHaveValue('');
    expect(count()).toBe('1 item');
    await user.type(input(), 'Eggs');
    await user.click(add());
    expect(items()).toEqual(['Milk', 'Eggs']);
    expect(count()).toBe('2 items');
  });

  test('pressing Enter in the input also adds (it is a real form)', async () => {
    const user = userEvent.setup();
    render(<ShoppingList />);
    await user.type(input(), 'Bread{Enter}');
    expect(items()).toEqual(['Bread']);
    expect(input()).toHaveValue('');
  });

  test('trims text and ignores blank input', async () => {
    const user = userEvent.setup();
    render(<ShoppingList />);
    await user.click(add());
    await user.type(input(), '   {Enter}');
    expect(items()).toEqual([]);
    await user.clear(input());
    await user.type(input(), '  Tea  {Enter}');
    expect(items()).toEqual(['Tea']);
  });

  test('each item has a labelled Remove button that removes it', async () => {
    const user = userEvent.setup();
    render(<ShoppingList initialItems={['Milk', 'Eggs', 'Tea']} />);
    await user.click(screen.getByRole('button', { name: 'Remove Eggs' }));
    expect(items()).toEqual(['Milk', 'Tea']);
    expect(count()).toBe('2 items');
  });

  test('removing one of two identical items removes only that one', async () => {
    const user = userEvent.setup();
    render(<ShoppingList initialItems={['Milk', 'Eggs']} />);
    await user.type(input(), 'Milk{Enter}');
    expect(items()).toEqual(['Milk', 'Eggs', 'Milk']);
    const first = screen.getAllByRole('listitem')[0];
    await user.click(within(first).getByRole('button', { name: 'Remove Milk' }));
    expect(items()).toEqual(['Eggs', 'Milk']);
  });

  test('removing everything brings back the empty state', async () => {
    const user = userEvent.setup();
    render(<ShoppingList initialItems={['Milk']} />);
    await user.click(screen.getByRole('button', { name: 'Remove Milk' }));
    expect(screen.getByText('Nothing to buy yet')).toBeInTheDocument();
    expect(count()).toBe('0 items');
  });
});
