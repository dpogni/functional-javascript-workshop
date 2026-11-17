// Your code and scoreboard live in this browser's localStorage.
const PREFIX = 'react-workshop:';

function read(key, fallback) {
  try {
    const value = localStorage.getItem(PREFIX + key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the app still works, it just won't remember */
  }
}

function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

export const loadCode = (id) => read(`code:${id}`, null);
export const saveCode = (id, code) => write(`code:${id}`, code);
export const clearCode = (id) => remove(`code:${id}`);
export const loadProgress = () => read('progress', {});
export const saveProgress = (progress) => write('progress', progress);
export const loadRevealed = () => read('revealed', {});
export const saveRevealed = (revealed) => write('revealed', revealed);
