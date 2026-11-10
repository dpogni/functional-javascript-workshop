// Browser playground: `npm run dev`. Renders YOUR code from /exercises so you
// can poke at it by hand. Grading still happens with `npm run check <n>`.
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Counter from '../exercises/01-counter/Counter.jsx';
import { ThemeProvider, ThemeToggle, useTheme } from '../exercises/02-theme-toggle/theme.jsx';
import usePrevious from '../exercises/03-use-previous/usePrevious.js';
import TodoList from '../exercises/04-memo-list/TodoList.jsx';
import TrafficLight from '../exercises/05-traffic-light/TrafficLight.jsx';
import useDebounce from '../exercises/06-use-debounce/useDebounce.js';
import OtpInput from '../exercises/07-otp-input/OtpInput.jsx';
import AutoCounter from '../exercises/08-stale-closure/AutoCounter.jsx';
import useInterval from '../exercises/09-use-interval/useInterval.js';
import SignupWizard from '../exercises/10-signup-wizard/SignupWizard.jsx';

function ThemeDemo() {
  function Panel() {
    const { theme } = useTheme();
    const dark = theme === 'dark';
    return (
      <div style={{ padding: 16, background: dark ? '#111' : '#f4f4f4', color: dark ? '#eee' : '#111' }}>
        Current theme: <b>{theme}</b>
      </div>
    );
  }
  return (
    <ThemeProvider>
      <ThemeToggle />
      <Panel />
    </ThemeProvider>
  );
}

function PreviousDemo() {
  const [n, setN] = useState(0);
  const prev = usePrevious(n);
  return (
    <div>
      <button onClick={() => setN((x) => x + 1)}>+1</button>
      <p>
        now: {n} · previous: {String(prev)}
      </p>
    </div>
  );
}

function DebounceDemo() {
  const [text, setText] = useState('');
  const debounced = useDebounce(text, 500);
  return (
    <div>
      <input placeholder="type fast…" value={text} onChange={(e) => setText(e.target.value)} />
      <p>instant: {text}</p>
      <p>debounced (500ms): {debounced}</p>
    </div>
  );
}

function IntervalDemo() {
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(true);
  useInterval(() => setTicks(ticks + 1), running ? 1000 : null);
  return (
    <div>
      <p>ticks: {ticks}</p>
      <button onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Resume'}</button>
    </div>
  );
}

const DEMOS = {
  '01 Counter': () => <Counter initialValue={0} />,
  '02 Theme': ThemeDemo,
  '03 usePrevious': PreviousDemo,
  '04 Memo list': () => (
    <TodoList
      initialTodos={[
        { id: 1, text: 'Write tests', done: false },
        { id: 2, text: 'Ship it', done: false },
        { id: 3, text: 'Celebrate', done: true },
      ]}
    />
  ),
  '05 Traffic light': () => <TrafficLight />,
  '06 useDebounce': DebounceDemo,
  '07 OTP input': () => <OtpInput onComplete={(code) => alert(`Complete: ${code}`)} />,
  '08 Auto-counter': () => <AutoCounter />,
  '09 useInterval': IntervalDemo,
  '10 Signup wizard': () => <SignupWizard onSubmit={(v) => console.log('submitted', v)} />,
};

function App() {
  const [current, setCurrent] = useState(() => localStorage.getItem('demo') ?? Object.keys(DEMOS)[0]);
  const Demo = DEMOS[current] ?? DEMOS['01 Counter'];
  const pick = (k) => {
    localStorage.setItem('demo', k);
    setCurrent(k);
  };
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '24px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 20 }}>React interview workshop: playground</h1>
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
        {Object.keys(DEMOS).map((k) => (
          <button key={k} onClick={() => pick(k)} style={{ fontWeight: k === current ? 700 : 400 }}>
            {k}
          </button>
        ))}
      </nav>
      <section style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16 }}>
        <Demo key={current} />
      </section>
      <p style={{ color: '#666', fontSize: 13 }}>
        Edit files in <code>exercises/</code>; this page hot-reloads. Grade with <code>npm run check &lt;n&gt;</code>.
      </p>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
