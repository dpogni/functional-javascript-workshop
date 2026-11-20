import { useEffect, useState } from 'react';

export default function UserProfile({ userId, fetchUser }) {
  // One object, so the UI can only ever be in one of the three states.
  const [state, setState] = useState({ status: 'loading' });
  const [attempt, setAttempt] = useState(0); // Retry bumps this to re-run the effect

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    setState({ status: 'loading' });

    fetchUser(userId, { signal: controller.signal }).then(
      (user) => {
        if (!ignore) setState({ status: 'success', user });
      },
      (error) => {
        if (!ignore) setState({ status: 'error', error });
      }
    );

    return () => {
      ignore = true; // results of this run are stale from now on
      controller.abort(); // and the request itself can stop
    };
  }, [userId, fetchUser, attempt]);

  if (state.status === 'loading') {
    return <p role="status">Loading…</p>;
  }

  if (state.status === 'error') {
    return (
      <div role="alert">
        <p>Could not load user: {state.error.message}</p>
        <button onClick={() => setAttempt((n) => n + 1)}>Retry</button>
      </div>
    );
  }

  return (
    <article>
      <h2>{state.user.name}</h2>
      <p>{state.user.email}</p>
    </article>
  );
}
