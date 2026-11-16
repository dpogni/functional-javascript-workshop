// Live previews: how each exercise is shown in the "Preview" tab.
// `mod` is the module compiled from the code in the editor.
import { useState } from 'react';

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

// Renders the default export with some props.
const component = (props = {}) =>
  function Demo({ mod }) {
    const C = mod.default;
    return <C {...props} />;
  };

function Note({ children }) {
  return <p style={{ color: '#667085', fontSize: 13 }}>{children}</p>;
}

export const demos = {
  '01-counter': component(),
  '02-controlled-input': component(),
  '03-list-state': component({ initialItems: ['Milk', 'Eggs'] }),
  '04-lifting-state': component({ items: FAQ }),

  '05-context-basics': function Demo({ mod }) {
    const { UserProvider, UserBadge } = mod;
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
  },

  '06-use-memo': component({ products: ['Apple', 'Apricot', 'Banana', 'Cherry'] }),
  '07-memo-callback': component(),

  '08-theme-toggle': function Demo({ mod }) {
    const { ThemeProvider, ThemeToggle, useTheme } = mod;
    function Panel() {
      const { theme } = useTheme();
      const dark = theme === 'dark';
      return (
        <div style={{ padding: 16, marginTop: 8, background: dark ? '#111' : '#f4f4f4', color: dark ? '#eee' : '#111' }}>
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
  },

  '09-ref-focus': component(),

  '10-use-toggle': function Demo({ mod }) {
    const { on, toggle, setOn, setOff } = mod.default();
    return (
      <div>
        <p>The light is {on ? 'ON 💡' : 'off'}</p>
        <button onClick={toggle}>toggle</button>
        <button onClick={setOn}>setOn</button>
        <button onClick={setOff}>setOff</button>
      </div>
    );
  },

  '11-effect-basics': function Demo({ mod }) {
    const [title, setTitle] = useState('Hello from exercise 11');
    mod.default(title);
    return (
      <div>
        <label>
          Title <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <p>
          <code>document.title</code> is now: <b>{document.title}</b>
        </p>
        <Note>Type to re-render. The line above shows the title as of the previous render.</Note>
      </div>
    );
  },

  '12-use-previous': function Demo({ mod }) {
    const [n, setN] = useState(0);
    const prev = mod.default(n);
    return (
      <div>
        <button onClick={() => setN((x) => x + 1)}>+1</button>
        <p>
          now: {n} · previous: {String(prev)}
        </p>
      </div>
    );
  },

  '13-memo-list': component({ initialTodos: TODOS }),
  '14-timeout-cleanup': component(),
  '15-stale-closure': component(),
  '16-traffic-light': component(),

  '17-use-debounce': function Demo({ mod }) {
    const [text, setText] = useState('');
    const debounced = mod.default(text, 500);
    return (
      <div>
        <input placeholder="type fast…" value={text} onChange={(e) => setText(e.target.value)} />
        <p>instant: {text}</p>
        <p>debounced (500ms): {debounced}</p>
      </div>
    );
  },

  '18-use-interval': function Demo({ mod }) {
    const [ticks, setTicks] = useState(0);
    const [running, setRunning] = useState(true);
    mod.default(() => setTicks(ticks + 1), running ? 1000 : null);
    return (
      <div>
        <p>ticks: {ticks}</p>
        <button onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Resume'}</button>
      </div>
    );
  },

  '19-tag-input': component({ initialTags: ['react', 'hooks'] }),
  '20-tabs-keyboard': component({ tabs: TABS }),

  '21-otp-input': function Demo({ mod }) {
    const C = mod.default;
    const [code, setCode] = useState(null);
    return (
      <div>
        <C onComplete={setCode} />
        <p>{code ? `onComplete("${code}")` : 'onComplete not called yet'}</p>
      </div>
    );
  },

  '22-reducer-basics': component({ products: PRODUCTS }),

  '23-form-validation': function Demo({ mod }) {
    const C = mod.default;
    const [sent, setSent] = useState(null);
    return (
      <div>
        <C onSubmit={setSent} />
        <p>{sent ? `onSubmit(${JSON.stringify(sent)})` : 'onSubmit not called yet'}</p>
      </div>
    );
  },

  '24-signup-wizard': function Demo({ mod }) {
    const C = mod.default;
    const [sent, setSent] = useState(null);
    return (
      <div>
        <C onSubmit={setSent} />
        {sent && <Note>onSubmit({JSON.stringify(sent)})</Note>}
      </div>
    );
  },
};
