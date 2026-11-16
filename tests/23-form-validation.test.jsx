import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@ex/23-form-validation/LoginForm.jsx';

const EMAIL_ERROR = 'Enter a valid email';
const PASSWORD_ERROR = 'Password must be at least 8 characters';

const email = () => screen.getByLabelText('Email');
const password = () => screen.getByLabelText('Password');
const submit = () => screen.getByRole('button', { name: 'Log in' });
const alerts = () => screen.queryAllByRole('alert').map((a) => a.textContent.trim());
const invalid = (el) => el.getAttribute('aria-invalid') === 'true';

function setup() {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} />);
  return { user, onSubmit };
}

describe('23 · Form validation: login form', () => {
  test('renders the fields with no errors initially', () => {
    setup();
    expect(email()).toHaveValue('');
    expect(password()).toHaveAttribute('type', 'password');
    expect(submit()).toBeEnabled();
    expect(alerts()).toEqual([]);
    expect(invalid(email())).toBe(false);
  });

  test('no error while typing in a field that has not been blurred', async () => {
    const { user } = setup();
    await user.type(email(), 'ada');
    expect(alerts()).toEqual([]);
  });

  test('blurring an invalid field shows its error and marks it aria-invalid', async () => {
    const { user } = setup();
    await user.type(email(), 'ada');
    await user.tab();
    expect(alerts()).toEqual([EMAIL_ERROR]);
    expect(invalid(email())).toBe(true);
    expect(invalid(password())).toBe(false);
  });

  test('blurring a valid field shows no error', async () => {
    const { user } = setup();
    await user.type(email(), 'ada@example.com');
    await user.tab();
    expect(alerts()).toEqual([]);
  });

  test('a shown error disappears as soon as the value becomes valid', async () => {
    const { user } = setup();
    await user.type(password(), 'short');
    await user.tab();
    expect(alerts()).toEqual([PASSWORD_ERROR]);
    await user.type(password(), '123');
    expect(alerts()).toEqual([]);
    expect(invalid(password())).toBe(false);
  });

  test('email validation rejects missing parts and spaces', async () => {
    const { user } = setup();
    for (const bad of ['ada@example', '@example.com', 'a b@example.com']) {
      await user.clear(email());
      await user.type(email(), bad);
      await user.tab();
      expect(alerts()).toContain(EMAIL_ERROR);
      expect(invalid(email())).toBe(true);
    }
  });

  test('submitting an empty form shows all errors and does not call onSubmit', async () => {
    const { user, onSubmit } = setup();
    await user.click(submit());
    expect(alerts()).toEqual([EMAIL_ERROR, PASSWORD_ERROR]);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('submitting with one invalid field does not call onSubmit', async () => {
    const { user, onSubmit } = setup();
    await user.type(email(), 'ada@example.com');
    await user.type(password(), 'short{Enter}');
    expect(alerts()).toEqual([PASSWORD_ERROR]);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('submitting valid values calls onSubmit once with them', async () => {
    const { user, onSubmit } = setup();
    await user.type(email(), 'ada@example.com');
    await user.type(password(), 'hunter22!');
    await user.click(submit());
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'hunter22!' });
    expect(alerts()).toEqual([]);
  });

  test('can recover from a failed submit', async () => {
    const { user, onSubmit } = setup();
    await user.click(submit());
    await user.type(email(), 'ada@example.com');
    await user.type(password(), 'hunter22!{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
