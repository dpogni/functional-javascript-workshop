// Pretend this is expensive. The grader counts how often it runs.
// You don't need to change this file.
let calls = 0;

export function slowFilter(products, query) {
  calls += 1;
  const q = query.trim().toLowerCase();
  return products.filter((p) => p.toLowerCase().includes(q));
}

export function getFilterCalls() {
  return calls;
}

export function resetFilterCalls() {
  calls = 0;
}
