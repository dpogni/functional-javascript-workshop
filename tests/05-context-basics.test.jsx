import { render, screen, renderHook, within } from '@testing-library/react';
import { UserProvider, useUser, UserBadge } from '@ex/05-context-basics/user.jsx';

// Components in the middle know nothing about the user: no props passed.
const Layout = ({ children }) => <main>{children}</main>;
const Header = () => (
  <header>
    <nav>
      <UserBadge />
    </nav>
  </header>
);

describe('05 · Context basics: current user', () => {
  test('useUser returns the user from the provider', () => {
    const ada = { name: 'Ada' };
    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => <UserProvider user={ada}>{children}</UserProvider>,
    });
    expect(result.current).toBe(ada);
  });

  test('useUser returns null without a provider', () => {
    const { result } = renderHook(() => useUser());
    expect(result.current).toBeNull();
  });

  test('UserBadge shows the user name, even deeply nested (no prop drilling)', () => {
    render(
      <UserProvider user={{ name: 'Ada' }}>
        <Layout>
          <Header />
        </Layout>
      </UserProvider>
    );
    expect(screen.getByText('Signed in as Ada')).toBeInTheDocument();
  });

  test('UserBadge shows "Not signed in" without a provider or with a null user', () => {
    const { unmount } = render(<UserBadge />);
    expect(screen.getByText('Not signed in')).toBeInTheDocument();
    unmount();
    render(
      <UserProvider user={null}>
        <UserBadge />
      </UserProvider>
    );
    expect(screen.getByText('Not signed in')).toBeInTheDocument();
  });

  test('consumers update when the provider value changes', () => {
    const { rerender } = render(
      <UserProvider user={{ name: 'Ada' }}>
        <Header />
      </UserProvider>
    );
    rerender(
      <UserProvider user={{ name: 'Grace' }}>
        <Header />
      </UserProvider>
    );
    expect(screen.getByText('Signed in as Grace')).toBeInTheDocument();
    rerender(
      <UserProvider user={null}>
        <Header />
      </UserProvider>
    );
    expect(screen.getByText('Not signed in')).toBeInTheDocument();
  });

  test('the nearest provider wins', () => {
    render(
      <UserProvider user={{ name: 'Outer' }}>
        <div data-testid="outer">
          <UserBadge />
        </div>
        <UserProvider user={{ name: 'Inner' }}>
          <div data-testid="inner">
            <UserBadge />
          </div>
        </UserProvider>
      </UserProvider>
    );
    expect(within(screen.getByTestId('outer')).getByText('Signed in as Outer')).toBeInTheDocument();
    expect(within(screen.getByTestId('inner')).getByText('Signed in as Inner')).toBeInTheDocument();
  });
});
