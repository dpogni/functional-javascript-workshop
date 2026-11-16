#!/usr/bin/env node
// Workshop CLI: `npm run progress`, `npm run check <n|all>`, `npm run watch <n>`
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROGRESS_FILE = join(ROOT, '.progress.json');
const VITEST = join(ROOT, 'node_modules', 'vitest', 'vitest.mjs');

const color = (code) => (s) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = color('32');
const red = color('31');
const dim = color('2');
const bold = color('1');

const exercises = readdirSync(join(ROOT, 'exercises'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^\d\d-/.test(d.name))
  .map((d) => d.name)
  .sort();

const readme = (name) => readFileSync(join(ROOT, 'exercises', name, 'README.md'), 'utf8');
const title = (name) => readme(name).split('\n')[0].replace(/^#\s*\d+\s*·\s*/, '');
const stage = (name) => readme(name).match(/\*\*Stage:\*\*\s*(.+?)\s*·\s*\*\*Level/)?.[1] ?? '';
const isInterview = (name) => readme(name).includes('★ Interview problem');

// Exercises were renumbered when the bridge exercises were added.
const RENAMED = {
  '02-theme-toggle': '08-theme-toggle',
  '03-use-previous': '12-use-previous',
  '04-memo-list': '13-memo-list',
  '05-traffic-light': '16-traffic-light',
  '06-use-debounce': '17-use-debounce',
  '07-otp-input': '21-otp-input',
  '08-stale-closure': '15-stale-closure',
  '09-use-interval': '18-use-interval',
  '10-signup-wizard': '24-signup-wizard',
};

const loadProgress = () => {
  try {
    const raw = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8'));
    return Object.fromEntries(Object.entries(raw).map(([k, v]) => [RENAMED[k] ?? k, v]));
  } catch {
    return {};
  }
};
const saveProgress = (p) => writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2) + '\n');

function resolveExercise(arg) {
  if (!arg) return null;
  const n = Number(arg);
  if (Number.isInteger(n)) return exercises.find((e) => Number(e.slice(0, 2)) === n) ?? null;
  return exercises.find((e) => e === arg || e.slice(3) === arg) ?? null;
}

function requireDeps() {
  if (!existsSync(VITEST)) {
    console.error(red('Dependencies are missing. Run `npm install` first.'));
    process.exit(1);
  }
}

function usage() {
  console.log(`
${bold('React interview workshop')}

  npm run progress        show your scoreboard
  npm run check <n>       grade exercise n (e.g. npm run check 3)
  npm run check all       grade every exercise
  npm run watch <n>       re-grade exercise n on every save
  npm run dev             open the browser playground
`);
}

function progress() {
  const p = loadProgress();
  let passed = 0;
  console.log(`\n${bold('React interview workshop: progress')}\n`);
  let currentStage = null;
  for (const ex of exercises) {
    if (stage(ex) !== currentStage) {
      currentStage = stage(ex);
      console.log(`\n  ${bold(`Stage ${currentStage}`)}`);
    }
    const r = p[ex];
    const icon = !r ? '⬜' : r.pass ? '✅' : '❌';
    if (r?.pass) passed++;
    const star = isInterview(ex) ? ' ★' : '';
    const detail = r ? dim(`  ${r.passed}/${r.total} tests`) : '';
    console.log(`  ${icon}  ${ex.slice(0, 2)}  ${title(ex)}${star}${detail}`);
  }
  console.log(dim('\n  ★ = one of the 10 interview problems; the rest are warm-ups that lead up to them'));
  console.log(`\n  ${bold(`${passed}/${exercises.length} passed`)}`);
  const next = exercises.find((e) => !p[e]?.pass);
  if (next) {
    console.log(`  Next up: ${bold(title(next))}`);
    console.log(dim(`    read  exercises/${next}/README.md`));
    console.log(dim(`    grade npm run check ${Number(next.slice(0, 2))}\n`));
  } else {
    console.log(green('  🎉 All done. You are interview-ready!\n'));
  }
}

function check(arg) {
  requireDeps();
  const all = arg === 'all';
  const ex = all ? null : resolveExercise(arg);
  if (!all && !ex) {
    console.error(red(`Unknown exercise "${arg ?? ''}".`) + ` Use a number 1-${exercises.length} or "all".`);
    usage();
    process.exit(1);
  }
  const targets = all ? exercises : [ex];
  const tmp = mkdtempSync(join(tmpdir(), 'workshop-'));
  const jsonFile = join(tmp, 'results.json');

  const files = targets.map((e) => `tests/${e}.test.jsx`);
  const res = spawnSync(
    process.execPath,
    [VITEST, 'run', ...files, '--reporter=verbose', '--reporter=json', `--outputFile.json=${jsonFile}`],
    { cwd: ROOT, stdio: 'inherit', env: { ...process.env, USE_SOLUTIONS: '' } }
  );

  let results = null;
  try {
    results = JSON.parse(readFileSync(jsonFile, 'utf8'));
  } catch {
    /* vitest crashed before writing results */
  }
  rmSync(tmp, { recursive: true, force: true });

  const p = loadProgress();
  const summary = [];
  for (const e of targets) {
    const file = results?.testResults.find((r) => r.name.replace(/\\/g, '/').endsWith(`tests/${e}.test.jsx`));
    const total = file?.assertionResults.length ?? 0;
    const passed = file?.assertionResults.filter((a) => a.status === 'passed').length ?? 0;
    const pass = total > 0 && passed === total;
    p[e] = { pass, passed, total, at: new Date().toISOString() };
    summary.push({ e, pass, passed, total });
  }
  saveProgress(p);

  console.log('');
  for (const { e, pass, passed, total } of summary) {
    const label = pass ? green(bold(' PASS ')) : red(bold(' FAIL '));
    console.log(`${label} ${e.slice(0, 2)} ${title(e)}  ${dim(`(${passed}/${total} tests)`)}`);
  }
  if (!all) {
    const { pass } = summary[0];
    console.log(
      pass
        ? green('\n  Nice! Run `npm run progress` to see what is next.\n')
        : red(`\n  Not yet. Re-read exercises/${ex}/README.md and the failing test names above.\n`)
    );
  } else {
    const n = summary.filter((s) => s.pass).length;
    console.log(bold(`\n  ${n}/${summary.length} exercises passing\n`));
  }
  process.exit(summary.every((s) => s.pass) && res.status === 0 ? 0 : 1);
}

function watch(arg) {
  requireDeps();
  const ex = resolveExercise(arg);
  if (!ex) {
    console.error(red(`Unknown exercise "${arg ?? ''}".`));
    usage();
    process.exit(1);
  }
  console.log(dim(`Watching exercises/${ex}. Save a file to re-grade. Ctrl+C to stop.\n`));
  const child = spawn(process.execPath, [VITEST, `tests/${ex}.test.jsx`, '--reporter=verbose'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, USE_SOLUTIONS: '' },
  });
  child.on('exit', (code) => process.exit(code ?? 0));
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'progress') progress();
else if (cmd === 'check') check(arg);
else if (cmd === 'watch') watch(arg);
else usage();
