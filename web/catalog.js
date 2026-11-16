// Builds the list of exercises from the files in /exercises and /solutions.
import { marked } from 'marked';

const readmes = import.meta.glob('../exercises/*/README.md', { query: '?raw', import: 'default', eager: true });
const starterFiles = import.meta.glob('../exercises/*/*.{js,jsx}', { query: '?raw', import: 'default', eager: true });
const solutionFiles = import.meta.glob('../solutions/*/*.{js,jsx}', { query: '?raw', import: 'default', eager: true });

function parse(path, readme) {
  const id = path.split('/').at(-2);
  const lines = readme.split('\n');
  const title = lines[0].replace(/^#\s*\d+\s*·\s*/, '');
  const meta = lines[2];
  const field = (name) => meta.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*(.+?)\\s*(?:·\\s*\\*\\*|·\\s*★|$)`))?.[1] ?? '';
  const file = field('File').replace(/`/g, '');

  // The brief, minus the title/metadata (shown in the UI) and the terminal
  // instructions (not relevant in the browser).
  const body = lines
    .slice(3)
    .join('\n')
    .replace(/## Check it[\s\S]*?(?=<details>|$)/, '');

  const helpers = Object.keys(starterFiles)
    .filter((p) => p.includes(`/${id}/`) && !p.endsWith(`/${file}`))
    .map((p) => ({ name: p.split('/').at(-1), code: starterFiles[p] }));

  return {
    id,
    number: id.slice(0, 2),
    title,
    stage: field('Stage'),
    level: field('Level'),
    topic: field('Topic'),
    interview: meta.includes('★'),
    file,
    starter: starterFiles[`../exercises/${id}/${file}`],
    solution: solutionFiles[`../solutions/${id}/${file}`],
    helpers,
    html: marked.parse(body),
  };
}

export const exercises = Object.entries(readmes)
  .map(([path, readme]) => parse(path, readme))
  .sort((a, b) => a.id.localeCompare(b.id));

export const stages = [...new Set(exercises.map((e) => e.stage))].map((stage) => ({
  stage,
  exercises: exercises.filter((e) => e.stage === stage),
}));

export const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
