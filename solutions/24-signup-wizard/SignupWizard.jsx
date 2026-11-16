import { useReducer } from 'react';

export const initialState = {
  step: 1,
  values: { email: '', password: '', fullName: '', username: '' },
  submitted: false,
};

const validators = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  password: (v) => v.length >= 8,
  fullName: (v) => v.trim().length > 0,
  username: (v) => /^\w{3,16}$/.test(v),
};

const STEP_FIELDS = { 1: ['email', 'password'], 2: ['fullName', 'username'], 3: [] };
const TITLES = { 1: 'Account', 2: 'Profile', 3: 'Review' };

export function validateStep(step, values) {
  return STEP_FIELDS[step].every((f) => validators[f](values[f]));
}

const allValid = (values) => [1, 2].every((s) => validateStep(s, values));

export function wizardReducer(state, action) {
  switch (action.type) {
    case 'CHANGE':
      return { ...state, values: { ...state.values, [action.field]: action.value } };
    case 'NEXT':
      if (state.step < 3 && validateStep(state.step, state.values)) {
        return { ...state, step: state.step + 1 };
      }
      return state;
    case 'BACK':
      return state.step > 1 ? { ...state, step: state.step - 1 } : state;
    case 'SUBMIT':
      return state.step === 3 && allValid(state.values) ? { ...state, submitted: true } : state;
    default:
      return state;
  }
}

function Field({ id, label, type = 'text', value, dispatch }) {
  return (
    <p>
      <label htmlFor={id}>{label}</label>{' '}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => dispatch({ type: 'CHANGE', field: id, value: e.target.value })}
      />
    </p>
  );
}

export default function SignupWizard({ onSubmit }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const { step, values, submitted } = state;

  if (submitted) return <p>Thanks for signing up, {values.fullName}!</p>;

  const handleSubmit = () => {
    if (step === 3 && allValid(values)) {
      dispatch({ type: 'SUBMIT' });
      onSubmit?.(values);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <p>Step {step} of 3</p>
      <h2>{TITLES[step]}</h2>

      {step === 1 && (
        <>
          <Field id="email" label="Email" type="email" value={values.email} dispatch={dispatch} />
          <Field id="password" label="Password" type="password" value={values.password} dispatch={dispatch} />
        </>
      )}

      {step === 2 && (
        <>
          <Field id="fullName" label="Full name" value={values.fullName} dispatch={dispatch} />
          <Field id="username" label="Username" value={values.username} dispatch={dispatch} />
        </>
      )}

      {step === 3 && (
        <dl>
          <dt>Email</dt>
          <dd>{values.email}</dd>
          <dt>Full name</dt>
          <dd>{values.fullName}</dd>
          <dt>Username</dt>
          <dd>{values.username}</dd>
          <dt>Password</dt>
          <dd>{'•'.repeat(values.password.length)}</dd>
        </dl>
      )}

      {step > 1 && (
        <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
          Back
        </button>
      )}
      {step < 3 && (
        <button
          type="button"
          disabled={!validateStep(step, values)}
          onClick={() => dispatch({ type: 'NEXT' })}
        >
          Next
        </button>
      )}
      {step === 3 && (
        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      )}
    </form>
  );
}
