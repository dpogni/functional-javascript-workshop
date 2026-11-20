import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfile from '@ex/29-data-fetching/UserProfile.jsx';

const ADA = { name: 'Ada Lovelace', email: 'ada@example.com' };
const GRACE = { name: 'Grace Hopper', email: 'grace@example.com' };

// A fake fetchUser whose requests finish only when the test says so.
function fakeApi() {
  const requests = [];
  const fetchUser = vi.fn((id, options = {}) => {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    requests.push({ id, signal: options.signal, resolve, reject });
    return promise;
  });
  return { fetchUser, requests };
}

const finish = (request, user) => act(async () => request.resolve(user));
const fail = (request, message) => act(async () => request.reject(new Error(message)));

const loading = () => screen.queryByRole('status');
const heading = () => screen.queryByRole('heading', { level: 2 });
const alert = () => screen.queryByRole('alert');

describe('29 · Data fetching: loading, errors and race conditions', () => {
  test('shows Loading… and requests the user with an AbortSignal', () => {
    const api = fakeApi();
    render(<UserProfile userId={1} fetchUser={api.fetchUser} />);
    expect(loading()).toHaveTextContent('Loading…');
    expect(api.fetchUser).toHaveBeenCalledTimes(1);
    expect(api.requests[0].id).toBe(1);
    expect(api.requests[0].signal).toBeInstanceOf(AbortSignal);
    expect(api.requests[0].signal.aborted).toBe(false);
  });

  test('shows the user once loaded', async () => {
    const api = fakeApi();
    render(<UserProfile userId={1} fetchUser={api.fetchUser} />);
    await finish(api.requests[0], ADA);
    expect(heading()).toHaveTextContent('Ada Lovelace');
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(loading()).not.toBeInTheDocument();
  });

  test('shows an error with the message', async () => {
    const api = fakeApi();
    render(<UserProfile userId={1} fetchUser={api.fetchUser} />);
    await fail(api.requests[0], 'Network down');
    expect(alert()).toHaveTextContent('Could not load user');
    expect(alert()).toHaveTextContent('Network down');
    expect(loading()).not.toBeInTheDocument();
  });

  test('Retry fetches the same user again', async () => {
    const user = userEvent.setup();
    const api = fakeApi();
    render(<UserProfile userId={7} fetchUser={api.fetchUser} />);
    await fail(api.requests[0], 'Timeout');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(api.fetchUser).toHaveBeenCalledTimes(2);
    expect(api.requests[1].id).toBe(7);
    expect(loading()).toBeInTheDocument();
    expect(alert()).not.toBeInTheDocument();
    await finish(api.requests[1], ADA);
    expect(heading()).toHaveTextContent('Ada Lovelace');
  });

  test('changing userId fetches again and hides the old user meanwhile', async () => {
    const api = fakeApi();
    const { rerender } = render(<UserProfile userId={1} fetchUser={api.fetchUser} />);
    await finish(api.requests[0], ADA);
    rerender(<UserProfile userId={2} fetchUser={api.fetchUser} />);
    expect(api.requests[1].id).toBe(2);
    expect(loading()).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    await finish(api.requests[1], GRACE);
    expect(heading()).toHaveTextContent('Grace Hopper');
  });

  test('a slow old response never overwrites the new one', async () => {
    const api = fakeApi();
    const { rerender } = render(<UserProfile userId={1} fetchUser={api.fetchUser} />);
    rerender(<UserProfile userId={2} fetchUser={api.fetchUser} />);
    await finish(api.requests[1], GRACE);
    await finish(api.requests[0], ADA); // arrives last
    expect(heading()).toHaveTextContent('Grace Hopper');
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
  });

  test('an old response that arrives first is ignored too', async () => {
    const api = fakeApi();
    const { rerender } = render(<UserProfile userId={1} fetchUser={api.fetchUser} />);
    rerender(<UserProfile userId={2} fetchUser={api.fetchUser} />);
    await finish(api.requests[0], ADA);
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    expect(loading()).toBeInTheDocument();
    await finish(api.requests[1], GRACE);
    expect(heading()).toHaveTextContent('Grace Hopper');
  });

  test('an old error is ignored', async () => {
    const api = fakeApi();
    const { rerender } = render(<UserProfile userId={1} fetchUser={api.fetchUser} />);
    rerender(<UserProfile userId={2} fetchUser={api.fetchUser} />);
    await fail(api.requests[0], 'Old failure');
    expect(alert()).not.toBeInTheDocument();
    await finish(api.requests[1], GRACE);
    expect(heading()).toHaveTextContent('Grace Hopper');
  });

  test('aborts the previous request when userId changes', () => {
    const api = fakeApi();
    const { rerender } = render(<UserProfile userId={1} fetchUser={api.fetchUser} />);
    rerender(<UserProfile userId={2} fetchUser={api.fetchUser} />);
    expect(api.requests[0].signal.aborted).toBe(true);
    expect(api.requests[1].signal.aborted).toBe(false);
  });

  test('aborts on unmount and does nothing afterwards', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const api = fakeApi();
    const { unmount } = render(<UserProfile userId={1} fetchUser={api.fetchUser} />);
    unmount();
    expect(api.requests[0].signal.aborted).toBe(true);
    await finish(api.requests[0], ADA);
    expect(errors).not.toHaveBeenCalled();
  });

  test('does not refetch when re-rendered with the same props', () => {
    const api = fakeApi();
    const { rerender } = render(<UserProfile userId={1} fetchUser={api.fetchUser} />);
    rerender(<UserProfile userId={1} fetchUser={api.fetchUser} />);
    rerender(<UserProfile userId={1} fetchUser={api.fetchUser} />);
    expect(api.fetchUser).toHaveBeenCalledTimes(1);
  });
});
