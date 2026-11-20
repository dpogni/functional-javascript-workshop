import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileExplorer from '@ex/26-file-explorer/FileExplorer.jsx';

const deepFreeze = (o) => {
  Object.values(o).forEach((v) => v && typeof v === 'object' && deepFreeze(v));
  return Object.freeze(o);
};

const TREE = () =>
  deepFreeze([
    { name: 'README.md' },
    {
      name: 'src',
      children: [
        { name: 'index.js' },
        {
          name: 'components',
          children: [{ name: 'Button.jsx' }, { name: 'icons', children: [{ name: 'star.svg' }] }],
        },
        { name: 'App.jsx' },
      ],
    },
    { name: 'package.json' },
    { name: 'public', children: [] },
  ]);

const folder = (name) => screen.getByRole('button', { name });
const root = () => screen.getByRole('list', { name: 'Files' });
// The names in one list, in order (each <li> directly under it).
const namesIn = (list) => [...list.children].map((li) => li.textContent);
const childList = (name) => within(folder(name).closest('li')).getAllByRole('list')[0];

function setup() {
  const user = userEvent.setup();
  render(<FileExplorer tree={TREE()} />);
  return { user };
}

describe('26 · File explorer: a recursive tree', () => {
  test('shows the top level: folders first, then files, sorted ignoring case', () => {
    setup();
    const names = namesIn(root());
    expect(names).toHaveLength(4);
    expect(names).toEqual([
      expect.stringContaining('public'),
      expect.stringContaining('src'),
      expect.stringContaining('package.json'),
      expect.stringContaining('README.md'),
    ]);
  });

  test('folders are collapsed buttons; files are not buttons', () => {
    setup();
    expect(folder('src')).toHaveAttribute('aria-expanded', 'false');
    expect(folder('public')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'README.md' })).not.toBeInTheDocument();
    expect(screen.queryByText('index.js')).not.toBeInTheDocument();
  });

  test('clicking a folder expands it and shows its sorted contents', async () => {
    const { user } = setup();
    await user.click(folder('src'));
    expect(folder('src')).toHaveAttribute('aria-expanded', 'true');
    expect(namesIn(childList('src'))).toEqual([
      expect.stringContaining('components'),
      expect.stringContaining('App.jsx'),
      expect.stringContaining('index.js'),
    ]);
    expect(folder('components')).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking an expanded folder collapses it', async () => {
    const { user } = setup();
    await user.click(folder('src'));
    await user.click(folder('src'));
    expect(folder('src')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('index.js')).not.toBeInTheDocument();
  });

  test('works at any depth', async () => {
    const { user } = setup();
    await user.click(folder('src'));
    await user.click(folder('components'));
    await user.click(folder('icons'));
    expect(screen.getByText('star.svg')).toBeInTheDocument();
    expect(namesIn(childList('components'))).toEqual([
      expect.stringContaining('icons'),
      expect.stringContaining('Button.jsx'),
    ]);
  });

  test('an expanded empty folder says (empty)', async () => {
    const { user } = setup();
    await user.click(folder('public'));
    expect(within(childList('public')).getByText('(empty)')).toBeInTheDocument();
  });

  test('re-expanding a folder restores the state of folders inside it', async () => {
    const { user } = setup();
    await user.click(folder('src'));
    await user.click(folder('components'));
    expect(screen.getByText('Button.jsx')).toBeInTheDocument();
    await user.click(folder('src'));
    expect(screen.queryByText('Button.jsx')).not.toBeInTheDocument();
    await user.click(folder('src'));
    expect(folder('components')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Button.jsx')).toBeInTheDocument();
  });

  test('folders with the same name in different places are independent', async () => {
    const user = userEvent.setup();
    const tree = deepFreeze([
      { name: 'a', children: [{ name: 'lib', children: [{ name: 'one.js' }] }] },
      { name: 'b', children: [{ name: 'lib', children: [{ name: 'two.js' }] }] },
    ]);
    render(<FileExplorer tree={tree} />);
    await user.click(folder('a'));
    await user.click(folder('b'));
    const [libA, libB] = screen.getAllByRole('button', { name: 'lib' });
    await user.click(libA);
    expect(screen.getByText('one.js')).toBeInTheDocument();
    expect(screen.queryByText('two.js')).not.toBeInTheDocument();
    expect(libB).toHaveAttribute('aria-expanded', 'false');
  });
});
