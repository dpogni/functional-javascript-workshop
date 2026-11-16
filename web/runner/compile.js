// Turns the text in the editor into a module object, in the browser.
import { transform } from 'sucrase';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as jsxRuntime from 'react/jsx-runtime';
import * as jsxDevRuntime from 'react/jsx-dev-runtime';

// Read-only helper files that exercise code may import with a relative path.
// Must be the very same module instances the tests import.
const helperModules = import.meta.glob('../../exercises/*/{renderTracker,slowFilter}.js', { eager: true });

const builtins = {
  react: React,
  'react-dom': ReactDOM,
  'react/jsx-runtime': jsxRuntime,
  'react/jsx-dev-runtime': jsxDevRuntime,
};

export class CompileError extends Error {}

export function compile(exercise, file, code) {
  let js;
  try {
    js = transform(code, {
      transforms: ['jsx', 'imports'],
      jsxRuntime: 'automatic',
      production: true,
      filePath: file,
    }).code;
  } catch (err) {
    throw new CompileError(err.message);
  }

  const require = (name) => {
    if (name in builtins) return builtins[name];
    if (name.startsWith('./')) {
      const helper = helperModules[`../../exercises/${exercise}/${name.slice(2)}`];
      if (helper) return helper;
    }
    throw new CompileError(
      `Cannot import "${name}". Only "react" and this exercise's helper files are available.`
    );
  };

  const module = { exports: {} };
  // eslint-disable-next-line no-new-func
  const run = new Function('require', 'module', 'exports', `${js}\n//# sourceURL=${file}`);
  run(require, module, module.exports);
  return module.exports;
}
