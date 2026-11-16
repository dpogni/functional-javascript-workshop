// Used by the grader to count renders. You don't need to change this file.
const counts = new Map();

export function trackRender(id) {
  counts.set(id, (counts.get(id) ?? 0) + 1);
}

export function getRenderCounts() {
  return Object.fromEntries(counts);
}

export function resetRenderCounts() {
  counts.clear();
}
