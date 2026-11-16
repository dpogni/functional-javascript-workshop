import { useState } from 'react';

function validate(values) {
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email';
  if (values.password.length < 8) errors.password = 'Password must be at least 8 characters';
  return errors;
}

export default function LoginForm({ onSubmit }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });

  // Derived on every render: never out of sync with `values`.
  const errors = validate(values);

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      setTouched({ email: true, password: true });
      return;
    }
    onSubmit?.(values);
  };

  const field = (name, label, type) => {
    const error = touched[name] ? errors[name] : undefined;
    return (
      <p>
        <label htmlFor={name}>{label}</label>{' '}
        <input
          id={name}
          name={name}
          type={type}
          value={values[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={error ? 'true' : 'false'}
        />
        {error && (
          <span role="alert" style={{ color: 'crimson', marginLeft: 8 }}>
            {error}
          </span>
        )}
      </p>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {field('email', 'Email', 'email')}
      {field('password', 'Password', 'password')}
      <button type="submit">Log in</button>
    </form>
  );
}
