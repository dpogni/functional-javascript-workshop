import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '@ex/28-data-table/DataTable.jsx';

const COLUMNS = Object.freeze([
  Object.freeze({ key: 'name', label: 'Name' }),
  Object.freeze({ key: 'role', label: 'Role' }),
  Object.freeze({ key: 'age', label: 'Age' }),
]);

const PEOPLE = [
  ['Ada', 'Engineer', 36],
  ['grace', 'Admiral', 85],
  ['Linus', 'Engineer', 9],
  ['Margaret', 'Director', 33],
  ['alan', 'Researcher', 41],
  ['Barbara', 'Engineer', 100],
  ['Ken', 'Researcher', 10],
  ['Dennis', 'Engineer', 70],
  ['Edsger', 'Professor', 72],
  ['frances', 'Engineer', 44],
  ['Tim', 'Engineer', 27],
  ['Katherine', 'Mathematician', 101],
];
const ROWS = () =>
  Object.freeze(PEOPLE.map(([name, role, age], i) => Object.freeze({ id: i + 1, name, role, age })));

const bodyRows = () => {
  const [, tbody] = screen.getAllByRole('rowgroup');
  return within(tbody)
    .getAllByRole('row')
    .map((r) => within(r).getAllByRole('cell').map((c) => c.textContent.trim()));
};
const names = () => bodyRows().map((r) => r[0]);
const header = (label) => screen.getByRole('button', { name: new RegExp(`^${label}`) });
const th = (label) => header(label).closest('th');
const pageInfo = () => screen.getByTestId('page-info').textContent.replace(/\s+/g, ' ').trim();
const next = () => screen.getByRole('button', { name: 'Next' });
const prev = () => screen.getByRole('button', { name: 'Previous' });
const filter = () => screen.getByLabelText('Filter');

function setup(props = {}) {
  const user = userEvent.setup();
  const utils = render(<DataTable columns={COLUMNS} rows={ROWS()} {...props} />);
  return { user, ...utils };
}

describe('28 · Data table: sort, filter, paginate', () => {
  test('shows the first page of rows in their original order', () => {
    setup();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(bodyRows()[0]).toEqual(['Ada', 'Engineer', '36']);
    expect(names()).toEqual(['Ada', 'grace', 'Linus', 'Margaret', 'alan']);
    expect(pageInfo()).toBe('Page 1 of 3');
    expect(prev()).toBeDisabled();
    expect(next()).toBeEnabled();
  });

  test('headers are sort buttons; nothing is sorted at first', () => {
    setup();
    for (const label of ['Name', 'Role', 'Age']) {
      expect(th(label)).toHaveAttribute('aria-sort', 'none');
    }
  });

  test('Next and Previous move between pages', async () => {
    const { user } = setup();
    await user.click(next());
    expect(pageInfo()).toBe('Page 2 of 3');
    expect(names()).toEqual(['Barbara', 'Ken', 'Dennis', 'Edsger', 'frances']);
    await user.click(next());
    expect(names()).toEqual(['Tim', 'Katherine']);
    expect(next()).toBeDisabled();
    await user.click(prev());
    expect(pageInfo()).toBe('Page 2 of 3');
  });

  test('respects pageSize', () => {
    setup({ pageSize: 4 });
    expect(names()).toHaveLength(4);
    expect(pageInfo()).toBe('Page 1 of 3');
  });

  test('sorts strings ignoring case, then toggles direction', async () => {
    const { user } = setup();
    await user.click(header('Name'));
    expect(th('Name')).toHaveAttribute('aria-sort', 'ascending');
    expect(names()).toEqual(['Ada', 'alan', 'Barbara', 'Dennis', 'Edsger']);
    await user.click(header('Name'));
    expect(th('Name')).toHaveAttribute('aria-sort', 'descending');
    expect(names()).toEqual(['Tim', 'Margaret', 'Linus', 'Ken', 'Katherine']);
    await user.click(header('Name'));
    expect(th('Name')).toHaveAttribute('aria-sort', 'ascending');
  });

  test('sorts numbers numerically', async () => {
    const { user } = setup();
    await user.click(header('Age'));
    expect(bodyRows().map((r) => r[2])).toEqual(['9', '10', '27', '33', '36']);
    await user.click(header('Age'));
    expect(bodyRows().map((r) => r[2])).toEqual(['101', '100', '85', '72', '70']);
  });

  test('sorting another column starts ascending and resets the others', async () => {
    const { user } = setup();
    await user.click(header('Name'));
    await user.click(header('Name'));
    await user.click(header('Age'));
    expect(th('Age')).toHaveAttribute('aria-sort', 'ascending');
    expect(th('Name')).toHaveAttribute('aria-sort', 'none');
  });

  test('sorting goes back to page 1', async () => {
    const { user } = setup();
    await user.click(next());
    await user.click(next());
    await user.click(header('Age'));
    expect(pageInfo()).toBe('Page 1 of 3');
    expect(names()[0]).toBe('Linus');
  });

  test('filters on any column, ignoring case, and goes back to page 1', async () => {
    const { user } = setup();
    await user.click(next());
    await user.type(filter(), 'ENGINEER');
    expect(pageInfo()).toBe('Page 1 of 2');
    expect(names()).toEqual(['Ada', 'Linus', 'Barbara', 'Dennis', 'frances']);
    await user.clear(filter());
    await user.type(filter(), 'mar');
    expect(names()).toEqual(['Margaret']);
  });

  test('numbers are matched as text', async () => {
    const { user } = setup();
    await user.type(filter(), '10');
    expect(names()).toEqual(['Barbara', 'Ken', 'Katherine']);
  });

  test('filter and sort combine', async () => {
    const { user } = setup();
    await user.type(filter(), 'research');
    await user.click(header('Age'));
    expect(names()).toEqual(['Ken', 'alan']);
    expect(pageInfo()).toBe('Page 1 of 1');
  });

  test('shows a message when nothing matches', async () => {
    const { user } = setup();
    await user.type(filter(), 'zzz');
    expect(bodyRows()).toEqual([['No matching rows']]);
    expect(pageInfo()).toBe('Page 1 of 1');
    expect(prev()).toBeDisabled();
    expect(next()).toBeDisabled();
  });

  test('shows new rows when the rows prop changes', () => {
    const { rerender } = setup();
    rerender(<DataTable columns={COLUMNS} rows={Object.freeze([{ id: 99, name: 'Hedy', role: 'Inventor', age: 85 }])} />);
    expect(bodyRows()).toEqual([['Hedy', 'Inventor', '85']]);
    expect(pageInfo()).toBe('Page 1 of 1');
  });
});
