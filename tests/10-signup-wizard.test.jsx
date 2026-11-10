import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupWizard, { initialState, wizardReducer } from '@ex/10-signup-wizard/SignupWizard.jsx';

const VALID = {
  email: 'ada@example.com',
  password: 'hunter22!',
  fullName: 'Ada Lovelace',
  username: 'ada_1815',
};

const withValues = (step, values) => ({ ...initialState, step, values: { ...initialState.values, ...values } });
const deepFreeze = (o) => {
  Object.values(o).forEach((v) => v && typeof v === 'object' && deepFreeze(v));
  return Object.freeze(o);
};

describe('10 · Signup wizard: reducer', () => {
  test('initialState has the documented shape', () => {
    expect(initialState).toEqual({
      step: 1,
      values: { email: '', password: '', fullName: '', username: '' },
      submitted: false,
    });
  });

  test('CHANGE updates one field immutably', () => {
    const state = deepFreeze(withValues(1, {}));
    const next = wizardReducer(state, { type: 'CHANGE', field: 'email', value: 'a@b.co' });
    expect(next.values.email).toBe('a@b.co');
    expect(next.values.password).toBe('');
    expect(next).not.toBe(state);
    expect(state.values.email).toBe('');
  });

  test('NEXT is blocked when the current step is invalid', () => {
    const bad = [
      { email: 'not-an-email', password: 'longenough' },
      { email: 'a b@c.com', password: 'longenough' },
      { email: 'ada@example.com', password: 'short' },
    ];
    for (const values of bad) {
      expect(wizardReducer(deepFreeze(withValues(1, values)), { type: 'NEXT' }).step).toBe(1);
    }
    const step2bad = [
      { ...VALID, fullName: '   ' },
      { ...VALID, username: 'ab' },
      { ...VALID, username: 'has space' },
      { ...VALID, username: 'a'.repeat(17) },
    ];
    for (const values of step2bad) {
      expect(wizardReducer(deepFreeze(withValues(2, values)), { type: 'NEXT' }).step).toBe(2);
    }
  });

  test('NEXT advances when the current step is valid, but never past step 3', () => {
    expect(wizardReducer(deepFreeze(withValues(1, VALID)), { type: 'NEXT' }).step).toBe(2);
    expect(wizardReducer(deepFreeze(withValues(2, VALID)), { type: 'NEXT' }).step).toBe(3);
    expect(wizardReducer(deepFreeze(withValues(3, VALID)), { type: 'NEXT' }).step).toBe(3);
  });

  test('NEXT on step 1 only validates step 1 fields', () => {
    const state = withValues(1, { email: VALID.email, password: VALID.password });
    expect(wizardReducer(deepFreeze(state), { type: 'NEXT' }).step).toBe(2);
  });

  test('BACK goes back without losing values, and never below step 1', () => {
    const state = deepFreeze(withValues(3, VALID));
    const back = wizardReducer(state, { type: 'BACK' });
    expect(back.step).toBe(2);
    expect(back.values).toEqual(VALID);
    expect(wizardReducer(deepFreeze(withValues(1, VALID)), { type: 'BACK' }).step).toBe(1);
  });

  test('SUBMIT only works on step 3 with valid values', () => {
    expect(wizardReducer(deepFreeze(withValues(3, VALID)), { type: 'SUBMIT' }).submitted).toBe(true);
    expect(wizardReducer(deepFreeze(withValues(2, VALID)), { type: 'SUBMIT' }).submitted).toBe(false);
    expect(
      wizardReducer(deepFreeze(withValues(3, { ...VALID, email: 'nope' })), { type: 'SUBMIT' }).submitted
    ).toBe(false);
  });

  test('unknown actions return the same state object', () => {
    const state = deepFreeze(withValues(2, VALID));
    expect(wizardReducer(state, { type: 'WHATEVER' })).toBe(state);
  });
});

describe('10 · Signup wizard: UI', () => {
  async function fillStep1(user, email = VALID.email, password = VALID.password) {
    await user.type(screen.getByLabelText('Email'), email);
    await user.type(screen.getByLabelText('Password'), password);
  }
  async function fillStep2(user) {
    await user.type(screen.getByLabelText('Full name'), VALID.fullName);
    await user.type(screen.getByLabelText('Username'), VALID.username);
  }
  const next = () => screen.getByRole('button', { name: 'Next' });

  test('step 1 shows Account fields, no Back button, and Next disabled until valid', async () => {
    const user = userEvent.setup();
    render(<SignupWizard onSubmit={() => {}} />);
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    expect(next()).toBeDisabled();
    await fillStep1(user, 'ada@example', 'hunter22!');
    expect(next()).toBeDisabled();
    await user.type(screen.getByLabelText('Email'), '.com');
    expect(next()).toBeEnabled();
  });

  test('step 2 validates the profile before Next is enabled', async () => {
    const user = userEvent.setup();
    render(<SignupWizard onSubmit={() => {}} />);
    await fillStep1(user);
    await user.click(next());
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Profile' })).toBeInTheDocument();
    expect(next()).toBeDisabled();
    await user.type(screen.getByLabelText('Full name'), VALID.fullName);
    await user.type(screen.getByLabelText('Username'), 'ab');
    expect(next()).toBeDisabled();
    await user.type(screen.getByLabelText('Username'), 'c');
    expect(next()).toBeEnabled();
  });

  test('going Back never loses what was typed', async () => {
    const user = userEvent.setup();
    render(<SignupWizard onSubmit={() => {}} />);
    await fillStep1(user);
    await user.click(next());
    await user.type(screen.getByLabelText('Full name'), 'Ada');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('Email')).toHaveValue(VALID.email);
    expect(screen.getByLabelText('Password')).toHaveValue(VALID.password);
    await user.click(next());
    expect(screen.getByLabelText('Full name')).toHaveValue('Ada');
  });

  test('review step shows the data (but not the password) and Back works', async () => {
    const user = userEvent.setup();
    render(<SignupWizard onSubmit={() => {}} />);
    await fillStep1(user);
    await user.click(next());
    await fillStep2(user);
    await user.click(next());
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Review' })).toBeInTheDocument();
    expect(document.body).toHaveTextContent(VALID.email);
    expect(document.body).toHaveTextContent(VALID.fullName);
    expect(document.body).toHaveTextContent(VALID.username);
    expect(document.body).not.toHaveTextContent(VALID.password);
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('Username')).toHaveValue(VALID.username);
  });

  test('Submit calls onSubmit once with all values and shows a thank-you message', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SignupWizard onSubmit={onSubmit} />);
    await fillStep1(user);
    await user.click(next());
    await fillStep2(user);
    await user.click(next());
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(VALID);
    expect(screen.getByText(`Thanks for signing up, ${VALID.fullName}!`)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
  });
});
