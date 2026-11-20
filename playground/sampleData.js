// Sample data for the stage 8 demos (used by the playground and the browser workshop).

export const FILE_TREE = [
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
];

export const TABLE_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'age', label: 'Age' },
];

export const TABLE_ROWS = [
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
].map(([name, role, age], i) => ({ id: i + 1, name, role, age }));

const USERS = {
  1: { name: 'Ada Lovelace', email: 'ada@example.com' },
  2: { name: 'Grace Hopper', email: 'grace@example.com' },
  3: { name: 'Alan Turing', email: 'alan@example.com' },
};

// A pretend API: user 1 is slow, user 2 is fast, user 3 fails every other time.
// Switching from 1 to 2 quickly is how you see the race condition.
let user3Calls = 0;
export function fakeFetchUser(id, { signal } = {}) {
  const delay = id === 1 ? 2000 : 400;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (id === 3 && user3Calls++ % 2 === 0) reject(new Error('Server returned 503'));
      else resolve(USERS[id]);
    }, delay);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}
