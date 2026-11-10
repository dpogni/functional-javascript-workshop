// TODO: implement ThemeProvider, useTheme and ThemeToggle (see README.md)

export function ThemeProvider({ initialTheme = 'light', children }) {
  return children;
}

export function useTheme() {
  return { theme: 'light', toggleTheme: () => {} };
}

export function ThemeToggle() {
  return <button>Toggle</button>;
}
