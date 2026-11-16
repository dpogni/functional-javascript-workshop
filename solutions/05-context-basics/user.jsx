import { createContext, useContext } from 'react';

// The default (null) is what consumers get when no provider is above them.
const UserContext = createContext(null);

export function UserProvider({ user, children }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}

export function UserBadge() {
  const user = useUser();
  return <span>{user ? `Signed in as ${user.name}` : 'Not signed in'}</span>;
}
