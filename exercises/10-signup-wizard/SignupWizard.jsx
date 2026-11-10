import { useReducer } from 'react';

// TODO: implement the wizard described in README.md

export const initialState = {
  step: 1,
  values: { email: '', password: '', fullName: '', username: '' },
  submitted: false,
};

export function wizardReducer(state, action) {
  return state;
}

export default function SignupWizard({ onSubmit }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  return <div>Signup wizard</div>;
}
