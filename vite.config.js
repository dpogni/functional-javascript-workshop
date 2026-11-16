import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const isVitest = !!process.env.VITEST;

// --- Terminal grader (`npm run check`) -------------------------------------
// Tests import your code through the "@ex" alias. `npm run verify-solutions`
// points the alias at /solutions instead, so the reference solutions can be
// checked against the exact same tests.
const target = process.env.USE_SOLUTIONS ? 'solutions' : 'exercises';

// --- Browser workshop (`npm run dev` / `npm run build`) --------------------
// In the browser the same test files run inside an iframe, but the code under
// test is whatever is in the editor. So "@ex/<exercise>/<file>" resolves to a
// tiny generated module that re-exports from a runtime registry which the
// runner fills with the compiled editor code before the tests are imported.
// Read-only helper files (render trackers etc.) resolve to the real file.
const SHIM = '\0ex-shim:';

function exportNames(code) {
  const names = new Set();
  for (const m of code.matchAll(/export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(m[1]);
  }
  return { names: [...names], hasDefault: /export\s+default\b/.test(code) };
}

function browserExerciseShim() {
  return {
    name: 'workshop-exercise-shim',
    enforce: 'pre',
    resolveId(source) {
      if (!source.startsWith('@ex/')) return null;
      const rel = source.slice(4);
      const exercise = resolve(root, 'exercises', rel);
      const solution = resolve(root, 'solutions', rel);
      const isHelper =
        existsSync(solution) && readFileSync(solution, 'utf8') === readFileSync(exercise, 'utf8');
      return isHelper ? exercise : SHIM + rel;
    },
    load(id) {
      if (!id.startsWith(SHIM)) return null;
      const rel = id.slice(SHIM.length);
      const { names, hasDefault } = exportNames(readFileSync(resolve(root, 'solutions', rel), 'utf8'));
      const registry = JSON.stringify(resolve(root, 'web/runner/registry.js'));
      return [
        `import { userModule } from ${registry};`,
        `const m = userModule(${JSON.stringify(rel)});`,
        hasDefault ? 'export default m.default;' : '',
        ...names.map((n) => `export const ${n} = m.${n};`),
      ].join('\n');
    },
  };
}

export default defineConfig({
  // Relative base so the built site works from any path (e.g. GitHub Pages).
  base: './',
  plugins: [react(), !isVitest && browserExerciseShim()],
  resolve: {
    alias: isVitest
      ? { '@ex': resolve(root, target) }
      : { vitest: resolve(root, 'web/runner/harness.js') },
  },
  // The in-browser grader relies on React's `act`, which only exists in
  // development builds of React, so the site is always built in dev mode.
  define: isVitest ? {} : { 'process.env.NODE_ENV': JSON.stringify('development') },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        runner: resolve(root, 'runner.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.{js,jsx}'],
    restoreMocks: true,
  },
});
