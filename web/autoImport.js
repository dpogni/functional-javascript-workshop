// VS Code-style auto-imports for the editor: pick `useState` from the
// completion list (Tab or Enter) and `import { useState } from 'react'` is
// added to, or merged into, the imports at the top of the file.
import { acceptCompletion, pickedCompletion } from '@codemirror/autocomplete';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { syntaxTree } from '@codemirror/language';
import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';

const REACT_EXPORTS = {
  // hooks
  useState: 'function', useEffect: 'function', useRef: 'function', useMemo: 'function',
  useCallback: 'function', useContext: 'function', useReducer: 'function',
  useLayoutEffect: 'function', useId: 'function', useTransition: 'function',
  useDeferredValue: 'function', useImperativeHandle: 'function',
  useSyncExternalStore: 'function', useInsertionEffect: 'function', useDebugValue: 'function',
  useOptimistic: 'function', useActionState: 'function', use: 'function',
  // everything else people import by name
  createContext: 'function', memo: 'function', forwardRef: 'function', lazy: 'function',
  startTransition: 'function', createElement: 'function', cloneElement: 'function',
  isValidElement: 'function', Fragment: 'class', StrictMode: 'class', Suspense: 'class',
  Children: 'variable',
};

const IMPORT_RE = /^[ \t]*import\b[^'"]*?from\s*(['"])([^'"]+)\1[ \t]*;?/gm;
const SIDE_EFFECT_IMPORT_RE = /^[ \t]*import\s*(['"])([^'"]+)\1[ \t]*;?/gm;

/** Names exported by a helper file, e.g. `trackRender` from renderTracker.js. */
export function exportedNames(code) {
  return [...code.matchAll(/export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/g)].map(
    (m) => m[1]
  );
}

/** Every identifier the file already imports (so we don't offer it again). */
export function importedNames(doc) {
  const names = new Set();
  for (const m of doc.matchAll(/^[ \t]*import\b([^'"]*?)from\s*['"][^'"]+['"]/gm)) {
    const clause = m[1];
    const braces = clause.match(/\{([^}]*)\}/);
    if (braces) {
      for (const part of braces[1].split(',')) {
        const local = part.trim().split(/\s+as\s+/).pop();
        if (local) names.add(local);
      }
    }
    const rest = clause.replace(/\{[^}]*\}/, '');
    for (const part of rest.split(',')) {
      const local = part.trim().split(/\s+as\s+/).pop();
      if (local && local !== '*') names.add(local);
    }
  }
  return names;
}

/**
 * Works out the edit that makes `name` imported from `source`.
 * Returns a CodeMirror change `{ from, to, insert }`, or null if nothing is needed.
 */
export function importChange(doc, name, source) {
  if (importedNames(doc).has(name)) return null;

  const imports = [...doc.matchAll(IMPORT_RE)];
  const quote = imports[0]?.[1] ?? doc.match(SIDE_EFFECT_IMPORT_RE)?.[0].match(/['"]/)?.[0] ?? "'";
  const semi = imports.length === 0 || imports.some((m) => m[0].trimEnd().endsWith(';')) ? ';' : '';

  for (const m of imports.filter((m) => m[2] === source)) {
    const statement = m[0];
    const open = statement.indexOf('{');
    const close = statement.indexOf('}');

    // import { a, b } from 'x'  →  add to the braces
    if (open !== -1 && close > open) {
      const inner = statement.slice(open + 1, close);
      const from = m.index + open + 1;
      const to = m.index + close;
      if (inner.includes('\n')) {
        // One name per line: keep that shape.
        const indent = inner.match(/\n([ \t]+)\S/)?.[1] ?? '  ';
        const body = inner.replace(/\s+$/, '');
        const comma = body.trim() === '' || body.endsWith(',') ? '' : ',';
        return { from, to, insert: `${body}${comma}\n${indent}${name},\n` };
      }
      const names = inner.split(',').map((s) => s.trim()).filter(Boolean);
      const key = (s) => s.split(/\s+as\s+/)[0].toLowerCase();
      const wasSorted = names.every((n, i) => i === 0 || key(names[i - 1]) <= key(n));
      names.push(name);
      if (wasSorted) names.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
      return { from, to, insert: ` ${names.join(', ')} ` };
    }

    // import React from 'x'  →  import React, { name } from 'x'
    const defaultOnly = statement.match(/^([ \t]*import\s+)([A-Za-z_$][\w$]*)(\s+from\b)/);
    if (defaultOnly) {
      const at = m.index + defaultOnly[1].length + defaultOnly[2].length;
      return { from: at, to: at, insert: `, { ${name} }` };
    }
    // import * as React from 'x'  →  falls through to a separate import line
  }

  const line = `import { ${name} } from ${quote}${source}${quote}${semi}\n`;

  // After the last existing import, if there is one...
  const all = [...imports, ...doc.matchAll(SIDE_EFFECT_IMPORT_RE)];
  if (all.length > 0) {
    const last = all.reduce((a, b) => (b.index > a.index ? b : a));
    let at = last.index + last[0].length;
    if (doc[at] === '\n') at += 1;
    else return { from: at, to: at, insert: `\n${line.trimEnd()}` };
    return { from: at, to: at, insert: line };
  }
  // ...otherwise at the very top, separated from the code by a blank line.
  const firstLineBlank = /^[ \t]*(\n|$)/.test(doc);
  return { from: 0, to: 0, insert: firstLineBlank ? line : `${line}\n` };
}

const SKIP_NODES = /String|Comment|TemplateString|RegExp|PropertyName|PropertyDefinition|JSXText|JSXAttributeValue/;

/**
 * @param {{ name: string, code: string }[]} helpers read-only files of the current exercise
 */
export function autoImport(helpers = []) {
  const candidates = [
    ...Object.entries(REACT_EXPORTS).map(([name, type]) => ({ name, type, source: 'react' })),
    ...helpers.flatMap((h) =>
      exportedNames(h.code).map((name) => ({ name, type: 'function', source: `./${h.name}` }))
    ),
  ];

  const apply = (candidate) => (view, completion, from, to) => {
    const doc = view.state.doc.toString();
    const changes = [{ from, to, insert: candidate.name }];
    const importEdit = importChange(doc, candidate.name, candidate.source);
    if (importEdit) changes.push(importEdit);
    const changeSet = view.state.changes(changes);
    view.dispatch({
      changes: changeSet,
      selection: { anchor: changeSet.mapPos(to, 1) },
      scrollIntoView: true,
      userEvent: 'input.complete',
      annotations: pickedCompletion.of(completion),
    });
  };

  const source = (context) => {
    const word = context.matchBefore(/[A-Za-z_$][\w$]*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    const { state } = context;
    if (state.sliceDoc(word.from - 1, word.from) === '.') return null; // member access
    if (SKIP_NODES.test(syntaxTree(state).resolveInner(context.pos, -1).name)) return null;
    if (/^\s*import\b/.test(state.doc.lineAt(context.pos).text)) return null; // typing an import by hand

    const already = importedNames(state.doc.toString());
    const options = candidates
      .filter((c) => !already.has(c.name))
      .map((c) => ({
        label: c.name,
        type: c.type,
        detail: `auto-import from '${c.source}'`,
        boost: 5,
        apply: apply(c),
      }));
    return { from: word.from, options, validFor: /^[\w$]*$/ };
  };

  return [
    javascriptLanguage.data.of({ autocomplete: source }),
    // Tab accepts the highlighted completion (as in VS Code); with no
    // completion open it falls through to normal indentation.
    Prec.highest(keymap.of([{ key: 'Tab', run: acceptCompletion }])),
  ];
}
