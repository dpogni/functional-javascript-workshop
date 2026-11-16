// Filled by the runner with the compiled editor code *before* a test file is
// imported. The generated "@ex/..." shim modules read from here.
const registry = new Map();

export function registerUserModule(rel, exports) {
  registry.set(rel, exports);
}

export function userModule(rel) {
  if (!registry.has(rel)) throw new Error(`No code registered for ${rel}`);
  return registry.get(rel);
}
