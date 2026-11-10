import { useState } from 'react';
import { render, screen, fireEvent, renderHook, within } from '@testing-library/react';
import { ThemeProvider, useTheme, ThemeToggle } from '@ex/02-theme-toggle/theme.jsx';

function ThemeLabel({ id = 'label' }) {
  const { theme } = useTheme();
  return <span data-testid={id}>{theme}</span>;
}

describe('02 · Toggle theme provider', () => {
  test('provides "light" by default', () => {
    render(
      <ThemeProvider>
        <ThemeLabel />
      </ThemeProvider>
    );
    expect(screen.getByTestId('label')).toHaveTextContent('light');
  });

  test('respects initialTheme', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <ThemeLabel />
      </ThemeProvider>
    );
    expect(screen.getByTestId('label')).toHaveTextContent('dark');
  });

  test('ThemeToggle flips the theme and its own label', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
        <ThemeLabel />
      </ThemeProvider>
    );
    const button = screen.getByRole('button', { name: 'Switch to dark mode' });
    fireEvent.click(button);
    expect(screen.getByTestId('label')).toHaveTextContent('dark');
    expect(button).toHaveTextContent('Switch to light mode');
    fireEvent.click(button);
    expect(screen.getByTestId('label')).toHaveTextContent('light');
    expect(button).toHaveTextContent('Switch to dark mode');
  });

  test('all consumers (even deeply nested) update together', () => {
    render(
      <ThemeProvider>
        <ThemeLabel id="a" />
        <div>
          <section>
            <ThemeLabel id="b" />
          </section>
        </div>
        <ThemeToggle />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('a')).toHaveTextContent('dark');
    expect(screen.getByTestId('b')).toHaveTextContent('dark');
  });

  test('sibling providers are independent', () => {
    render(
      <>
        <div data-testid="one">
          <ThemeProvider>
            <ThemeToggle />
            <ThemeLabel />
          </ThemeProvider>
        </div>
        <div data-testid="two">
          <ThemeProvider>
            <ThemeToggle />
            <ThemeLabel />
          </ThemeProvider>
        </div>
      </>
    );
    const one = within(screen.getByTestId('one'));
    const two = within(screen.getByTestId('two'));
    fireEvent.click(one.getByRole('button'));
    expect(one.getByTestId('label')).toHaveTextContent('dark');
    expect(two.getByTestId('label')).toHaveTextContent('light');
  });

  test('useTheme throws a helpful error outside a ThemeProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/);
    spy.mockRestore();
  });

  test('toggleTheme keeps the same identity across provider re-renders', () => {
    const seen = [];
    function Spy() {
      seen.push(useTheme().toggleTheme);
      return null;
    }
    function Parent() {
      const [n, setN] = useState(0);
      return (
        <>
          <button onClick={() => setN(n + 1)}>rerender parent</button>
          <ThemeProvider>
            <Spy />
            <ThemeToggle />
          </ThemeProvider>
        </>
      );
    }
    render(<Parent />);
    fireEvent.click(screen.getByText('rerender parent'));
    fireEvent.click(screen.getByText('Switch to dark mode'));
    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(new Set(seen).size).toBe(1);
  });
});
