# 29 · Data fetching: loading, errors and race conditions

**Stage:** 8 · Interview classics · **Level:** Advanced · **Topic:** Async effects & cancellation · **File:** `UserProfile.jsx` · ★ Interview problem

**Builds on:** effects with cleanup (11), timers that must be cancelled (14–18).  
**New here:** an effect whose result arrives *later*, possibly after the
component has moved on to a different request, or unmounted.

"Fetch some data and show it" is asked in almost every React interview. The
follow-up is always "what happens if the user switches quickly?"

## Requirements

`export default function UserProfile({ userId, fetchUser })`

`fetchUser(id, { signal })` returns a Promise that resolves to
`{ name, email }` or rejects with an `Error`. It's passed in as a prop (instead
of calling `fetch` directly) so the grader can control when each request
finishes. Pass `signal` through, as you would to `fetch`.

**Loading**
- On mount, and whenever `userId` changes, call
  `fetchUser(userId, { signal })` with an `AbortSignal`.
- While a request is in flight, show `Loading…` inside an element with
  `role="status"`, and **don't** show the previous user's details.

**Success**
- Show the user's `name` in an `<h2>` and their `email` as text.

**Errors**
- Show an element with `role="alert"` containing `Could not load user` and the
  error's `message`.
- A **Retry** button fetches the same user again (showing `Loading…` meanwhile).

**Race conditions and cleanup**
- If `userId` changes before the previous request finishes, the previous
  response (success **or** error) must never be shown, even if it arrives last.
- The previous request's signal is aborted when `userId` changes, and the
  in-flight request's signal is aborted when the component unmounts.
- Nothing happens after unmount: no state updates, no console errors.

## Check it

```bash
npm run check 29
```

<details><summary>Hint</summary>

One effect with `[userId, fetchUser, attempt]` as dependencies, where `attempt`
is a counter that Retry increments. Inside it:

```js
const controller = new AbortController();
let ignore = false;
// set loading, call fetchUser(userId, { signal: controller.signal }),
// and in .then / .catch: if (ignore) return;
return () => { ignore = true; controller.abort(); };
```
Model the state as one object: `{ status: 'loading' | 'success' | 'error', user, error }`.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Synchronizing with effects (see "Fetching data")](https://react.dev/learn/synchronizing-with-effects#fetching-data)
- [You might not need an effect (see "Fetching data")](https://react.dev/learn/you-might-not-need-an-effect#fetching-data)
- [Lifecycle of reactive effects](https://react.dev/learn/lifecycle-of-reactive-effects)
- [`useEffect` reference](https://react.dev/reference/react/useEffect)
- [Choosing the state structure (avoid redundant state)](https://react.dev/learn/choosing-the-state-structure)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** a request started for one `userId` can finish after
you've moved on to another, and React will happily render whatever you `setState`
last.

**The race**

1. `userId` is 1: request A starts.
2. The user picks 2: request B starts.
3. B answers first: the profile shows user 2.
4. A answers late: the naive `.then(setUser)` overwrites it with user 1, while
   the UI says you're looking at user 2.

Networks don't answer in order, so this happens in real apps, not only in tests.

**The fix: every effect run owns its request**

```js
useEffect(() => {
  const controller = new AbortController();
  let ignore = false;
  setState({ status: 'loading' });

  fetchUser(userId, { signal: controller.signal }).then(
    (user) => { if (!ignore) setState({ status: 'success', user }); },
    (error) => { if (!ignore) setState({ status: 'error', error }); }
  );

  return () => {
    ignore = true;          // this run's results are now stale
    controller.abort();     // and the network work can stop
  };
}, [userId, fetchUser, attempt]);
```

When `userId` changes, React runs the previous run's cleanup *before* starting
the next one. That cleanup flips the old run's own `ignore`, a variable that
the late `.then` closes over. Each run has its own `ignore`, so new requests are
unaffected. Unmounting runs the same cleanup, so nothing updates afterwards.

`ignore` and `abort()` do different jobs. `ignore` guarantees correctness,
because the response is dropped even if the request can't be cancelled.
`abort()` saves work: the browser cancels the HTTP request, and `fetch` rejects
with an `AbortError`, which the `ignore` check also swallows.

**One state object, not three booleans**

`isLoading`, `data` and `error` as separate state can contradict each other
(loading *and* error at once, or old data shown with a new error). A single
`{ status, user, error }` value can only be in one state, and setting
`{ status: 'loading' }` drops the previous user, which is the "don't show stale
data" requirement for free.

**Retry**

Retry doesn't call `fetchUser` itself. It bumps an `attempt` counter, which is
an effect dependency, so the effect runs again with all the same race and
cleanup protection. The fetch logic exists in one place only.

**About `fetchUser` as a dependency**

The effect uses it, so it is listed. If a parent passed a new inline function
on every render, the effect would refetch on every render. The parent should
pass a stable function (defined outside the component, or with
`useCallback`). Leaving it out of the list to dodge this is the stale-closure
bug from exercise 15.

**What to say in an interview**

In development, Strict Mode mounts components twice, so you'll see two requests
in the network tab; the cleanup makes the first one harmless. In production
code, most teams use a data library (TanStack Query, SWR, or their framework's
loader) that adds caching, deduplication and refetching on top of exactly this
pattern. Interviewers want to know you understand what those libraries handle
for you.
</details>
