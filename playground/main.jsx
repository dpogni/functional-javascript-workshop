// Browser playground: `npm run dev`. Renders YOUR code from /exercises so you
// can poke at it by hand. Grading still happens with `npm run check <n>`.
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Counter from '../exercises/01-counter/Counter.jsx';
import Greeting from '../exercises/02-controlled-input/Greeting.jsx';
import ShoppingList from '../exercises/03-list-state/ShoppingList.jsx';
import Accordion from '../exercises/04-lifting-state/Accordion.jsx';
import { UserProvider, UserBadge } from '../exercises/05-context-basics/user.jsx';
import ProductSearch from '../exercises/06-use-memo/ProductSearch.jsx';
import NoteEditor from '../exercises/07-memo-callback/NoteEditor.jsx';
import { ThemeProvider, ThemeToggle, useTheme } from '../exercises/08-theme-toggle/theme.jsx';
import SearchBox from '../exercises/09-ref-focus/SearchBox.jsx';
import useToggle from '../exercises/10-use-toggle/useToggle.js';
import useDocumentTitle from '../exercises/11-effect-basics/useDocumentTitle.js';
import usePrevious from '../exercises/12-use-previous/usePrevious.js';
import TodoList from '../exercises/13-memo-list/TodoList.jsx';
import SaveButton from '../exercises/14-timeout-cleanup/SaveButton.jsx';
import AutoCounter from '../exercises/15-stale-closure/AutoCounter.jsx';
import TrafficLight from '../exercises/16-traffic-light/TrafficLight.jsx';
import useDebounce from '../exercises/17-use-debounce/useDebounce.js';
import useInterval from '../exercises/18-use-interval/useInterval.js';
import TagInput from '../exercises/19-tag-input/TagInput.jsx';
import Tabs from '../exercises/20-tabs-keyboard/Tabs.jsx';
import OtpInput from '../exercises/21-otp-input/OtpInput.jsx';
import Cart from '../exercises/22-reducer-basics/Cart.jsx';
import LoginForm from '../exercises/23-form-validation/LoginForm.jsx';
import SignupWizard from '../exercises/24-signup-wizard/SignupWizard.jsx';

function UserDemo() {
  const [signedIn, setSignedIn] = useState(true);
  return (
    <UserProvider user={signedIn ? { name: 'Ada' } : null}>
      <button onClick={() => setSignedIn((s) => !s)}>{signedIn ? 'Sign out' : 'Sign in'}</button>
      <header>
        <nav>
          <UserBadge />
        </nav>
      </header>
    </UserProvider>
  );
}

function ToggleDemo() {
  const { on, toggle, setOn, setOff } = useToggle();
  return (
    <div>
      <p>The light is {on ? 'ON 💡' : 'off'}</p>
      <button onClick={toggle}>toggle</button> <button onClick={setOn}>setOn</button>{' '}
      <button onClick={setOff}>setOff</button>
    </div>
  );
}

function TitleDemo() {
  const [title, setTitle] = useState('Hello from exercise 11');
  useDocumentTitle(title);
  return (
    <label>
      Tab title <input value={title} onChange={(e) => setTitle(e.target.value)} />
    </label>
  );
}

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

const FAQ = [
  { id: 'a', title: 'What is React?', content: 'A UI library.' },
  { id: 'b', title: 'What is JSX?', content: 'Syntax sugar for createElement.' },
  { id: 'c', title: 'What is a hook?', content: 'A function that taps into React features.' },
];
const TODOS = [
  { id: 1, text: 'Write tests', done: false },
  { id: 2, text: 'Ship it', done: false },
  { id: 3, text: 'Celebrate', done: true },
];
const TABS = [
  { id: 'html', label: 'HTML', content: 'Structure of the page' },
  { id: 'css', label: 'CSS', content: 'Style of the page' },
  { id: 'js', label: 'JavaScript', content: 'Behaviour of the page' },
];
const PRODUCTS = [
  { id: 'c', name: 'Coffee', price: 3.5 },
  { id: 'b', name: 'Bagel', price: 2.25 },
];

const DEMOS = {
  '01 Counter': () => <Counter initialValue={0} />,
  '02 Greeting': () => <Greeting />,
  '03 Shopping list': () => <ShoppingList initialItems={['Milk', 'Eggs']} />,
  '04 Accordion': () => <Accordion items={FAQ} />,
  '05 User context': UserDemo,
  '06 useMemo search': () => <ProductSearch products={['Apple', 'Apricot', 'Banana', 'Cherry']} />,
  '07 Note editor': () => <NoteEditor />,
  '08 Theme': ThemeDemo,
  '09 Search box': () => <SearchBox />,
  '10 useToggle': ToggleDemo,
  '11 useDocumentTitle': TitleDemo,
  '12 usePrevious': PreviousDemo,
  '13 Memo list': () => <TodoList initialTodos={TODOS} />,
  '14 Save button': () => <SaveButton />,
  '15 Auto-counter': () => <AutoCounter />,
  '16 Traffic light': () => <TrafficLight />,
  '17 useDebounce': DebounceDemo,
  '18 useInterval': IntervalDemo,
  '19 Tag input': () => <TagInput initialTags={['react', 'hooks']} />,
  '20 Tabs': () => <Tabs tabs={TABS} />,
  '21 OTP input': () => <OtpInput onComplete={(code) => alert(`Complete: ${code}`)} />,
  '22 Cart': () => <Cart products={PRODUCTS} />,
  '23 Login form': () => <LoginForm onSubmit={(v) => alert(`Logged in as ${v.email}`)} />,
  '24 Signup wizard': () => <SignupWizard onSubmit={(v) => console.log('submitted', v)} />,
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
