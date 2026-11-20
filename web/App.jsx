import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { exercises, stages, byId } from './catalog.js';
import {
  loadCode,
  saveCode,
  clearCode,
  loadProgress,
  saveProgress,
  loadRevealed,
  saveRevealed,
} from './storage.js';
import { runTests, createSandboxFrame, connect } from './sandbox.js';
import { autoImport } from './autoImport.js';

const idFromHash = () => {
  const id = window.location.hash.replace(/^#\/?/, '');
  return byId[id] ? id : null;
};

function useCurrentExercise() {
  const [id, setId] = useState(() => idFromHash() ?? exercises[0].id);
  useEffect(() => {
    const onHash = () => {
      const next = idFromHash();
      if (next) setId(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return byId[id];
}

const levelClass = (level) => `level level-${level.toLowerCase().replace(/[^a-z]/g, '')}`;

function Sidebar({ current, progress, open, onClose }) {
  const passed = exercises.filter((e) => progress[e.id]?.pass).length;
  return (
    <nav className={`sidebar ${open ? 'open' : ''}`} aria-label="Exercises">
      <div className="sidebar-progress">
        <div className="bar">
          <div style={{ width: `${(passed / exercises.length) * 100}%` }} />
        </div>
        <span>
          {passed}/{exercises.length} solved
        </span>
      </div>
      {stages.map(({ stage, exercises: list }) => (
        <section key={stage}>
          <h3>Stage {stage}</h3>
          <ul>
            {list.map((e) => {
              const p = progress[e.id];
              const status = !p ? 'todo' : p.pass ? 'pass' : 'fail';
              return (
                <li key={e.id}>
                  <a
                    href={`#/${e.id}`}
                    className={e.id === current.id ? 'active' : ''}
                    aria-current={e.id === current.id ? 'page' : undefined}
                    onClick={onClose}
                  >
                    <span className={`status status-${status}`} title={status}>
                      {status === 'pass' ? '✓' : status === 'fail' ? '✗' : '○'}
                    </span>
                    <span className="num">{e.number}</span>
                    <span className="name">{e.title}</span>
                    {e.interview && (
                      <span className="star" title="Interview problem">
                        ★
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="sidebar-note">★ = interview problem. The rest are warm-ups that lead up to them.</p>
    </nav>
  );
}

function Description({ exercise }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.scrollTo(0, 0);
  }, [exercise.id]);
  return (
    <article className="description" ref={ref}>
      <h1>
        {exercise.number}. {exercise.title}
      </h1>
      <div className="badges">
        <span className={levelClass(exercise.level)}>{exercise.level}</span>
        {exercise.interview && <span className="badge star-badge">★ Interview problem</span>}
        <span className="badge">{exercise.topic}</span>
      </div>
      {/* The briefs are this repo's own README files. */}
      <div className="markdown" dangerouslySetInnerHTML={{ __html: exercise.html }} />
    </article>
  );
}

function Results({ run, exercise, next }) {
  if (!run) {
    return (
      <div className="empty">
        Press <b>Run tests</b> (or Ctrl/⌘ + Enter) to grade your code.
      </div>
    );
  }
  const { status, results = [], compileError, timedOut } = run;
  const passed = results.filter((r) => r.pass).length;
  const accepted = status === 'done' && !compileError && !timedOut && results.length > 0 && passed === results.length;

  let verdict;
  if (status === 'running') verdict = <div className="verdict running">Running… {results.length} tests so far</div>;
  else if (compileError)
    verdict = (
      <div className="verdict fail">{compileError.startsWith('Syntax error') ? 'Compile Error' : 'Runtime Error'}</div>
    );
  else if (timedOut)
    verdict = <div className="verdict fail">Time Limit Exceeded: the run did not finish (infinite loop?)</div>;
  else if (accepted)
    verdict = (
      <div className="verdict pass">
        <span>
          Accepted <small>{passed}/{results.length} tests passed</small>
        </span>
        {next && (
          <a className="next" href={`#/${next.id}`}>
            Next: {next.number}. {next.title} →
          </a>
        )}
      </div>
    );
  else
    verdict = (
      <div className="verdict fail">
        Wrong Answer <small>{passed}/{results.length} tests passed</small>
      </div>
    );

  let lastSuite = null;
  return (
    <div className="results" data-testid="results" data-status={status} data-accepted={String(accepted)}>
      {verdict}
      {compileError && <pre className="error">{compileError}</pre>}
      <ul>
        {results.map((r, i) => {
          const header = r.suite !== lastSuite ? <li className="suite">{r.suite}</li> : null;
          lastSuite = r.suite;
          return (
            <FragmentWithHeader key={`${exercise.id}-${i}`} header={header}>
              <li className={r.pass ? 'case pass' : 'case fail'}>
                <span className="mark">{r.pass ? '✓' : '✗'}</span>
                <div>
                  <span>{r.name}</span>
                  {!r.pass && <pre className="error">{r.error}</pre>}
                </div>
              </li>
            </FragmentWithHeader>
          );
        })}
      </ul>
    </div>
  );
}

const FragmentWithHeader = ({ header, children }) => (
  <>
    {header}
    {children}
  </>
);

function Preview({ exercise, code }) {
  const holder = useRef(null);
  const [debounced, setDebounced] = useState(code);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(code), 400);
    return () => clearTimeout(id);
  }, [code]);

  // A fresh frame for every version of the code: no stale timers or state.
  useEffect(() => {
    const frame = createSandboxFrame();
    frame.className = 'preview-frame';
    frame.title = 'Live preview';
    const disconnect = connect(frame, {
      type: 'preview',
      exercise: exercise.id,
      file: exercise.file,
      code: debounced,
    });
    holder.current.append(frame);
    return () => {
      disconnect();
      frame.remove();
    };
  }, [exercise.id, exercise.file, debounced]);

  return <div className="preview" ref={holder} />;
}

export default function App() {
  const exercise = useCurrentExercise();
  const [progress, setProgress] = useState(loadProgress);
  const [codeById, setCodeById] = useState({});
  const [runs, setRuns] = useState({});
  const [tab, setTab] = useState('preview');
  const [fileTab, setFileTab] = useState('main');
  // Exercises whose solution has been revealed: their Solution tab stays put.
  const [revealed, setRevealed] = useState(loadRevealed);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const code = codeById[exercise.id] ?? loadCode(exercise.id) ?? exercise.starter;
  const index = exercises.indexOf(exercise);
  const prev = exercises[index - 1];
  const next = exercises[index + 1];

  useEffect(() => {
    setFileTab('main');
    setTab('preview');
    document.title = `${exercise.number}. ${exercise.title} · React Interview Workshop`;
  }, [exercise]);

  const setCode = useCallback(
    (value) => {
      setCodeById((all) => ({ ...all, [exercise.id]: value }));
      saveCode(exercise.id, value);
    },
    [exercise.id]
  );

  // Always run the latest code, even from the editor's (stable) key binding.
  const latest = useRef({});
  latest.current = { exercise, code, busy };

  const run = useCallback(async () => {
    const { exercise, code, busy } = latest.current;
    if (busy) return;
    setBusy(true);
    setTab('tests');
    const id = exercise.id;
    setRuns((all) => ({ ...all, [id]: { status: 'running', results: [] } }));
    const outcome = await runTests({ exercise: id, file: exercise.file, code }, (result) =>
      setRuns((all) => ({ ...all, [id]: { status: 'running', results: [...all[id].results, result] } }))
    );
    const results = outcome.results ?? [];
    const passed = results.filter((r) => r.pass).length;
    const pass = !outcome.compileError && !outcome.timedOut && results.length > 0 && passed === results.length;
    setRuns((all) => ({ ...all, [id]: { status: 'done', ...outcome, results } }));
    setProgress((p) => {
      const updated = { ...p, [id]: { pass, passed, total: results.length } };
      saveProgress(updated);
      return updated;
    });
    setBusy(false);
  }, []);

  const reset = () => {
    if (!window.confirm('Reset this exercise to the starter code? Your code for it will be lost.')) return;
    clearCode(exercise.id);
    setCodeById((all) => ({ ...all, [exercise.id]: exercise.starter }));
    setRuns((all) => ({ ...all, [exercise.id]: undefined }));
    setFileTab('main');
  };

  const solutionRevealed = !!revealed[exercise.id];
  const showSolution = () => {
    if (fileTab === 'solution') return setFileTab('main');
    // Only ask the first time; after that the tab is always there.
    if (
      solutionRevealed ||
      window.confirm('Peek at the reference solution? Try the hint at the bottom of the brief first.')
    ) {
      if (!solutionRevealed) {
        const updated = { ...revealed, [exercise.id]: true };
        setRevealed(updated);
        saveRevealed(updated);
      }
      setFileTab('solution');
    }
  };

  const extensions = useMemo(
    () => [
      javascript({ jsx: true }),
      autoImport(exercise.helpers),
      Prec.highest(
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              run();
              return true;
            },
          },
        ])
      ),
    ],
    [run, exercise.helpers]
  );

  const readOnlyExtensions = useMemo(() => [javascript({ jsx: true })], []);
  const helper = exercise.helpers.find((h) => h.name === fileTab);
  const readOnly = fileTab !== 'main';
  const shown = fileTab === 'solution' ? exercise.solution : helper?.code ?? '';

  return (
    <div className="app">
      <header className="topbar">
        <button className="icon" aria-label="Toggle exercise list" onClick={() => setSidebarOpen((o) => !o)}>
          ☰
        </button>
        <strong className="brand">React Interview Workshop</strong>
        <div className="pager">
          <a className={`icon ${prev ? '' : 'disabled'}`} href={prev ? `#/${prev.id}` : undefined} aria-label="Previous exercise">
            ‹
          </a>
          <span>
            {index + 1} / {exercises.length}
          </span>
          <a className={`icon ${next ? '' : 'disabled'}`} href={next ? `#/${next.id}` : undefined} aria-label="Next exercise">
            ›
          </a>
        </div>
        <div className="actions">
          <button onClick={reset}>Reset</button>
          <button onClick={showSolution}>{fileTab === 'solution' ? 'Back to my code' : 'Solution'}</button>
          <button className="primary" onClick={run} disabled={busy}>
            {busy ? 'Running…' : <>▶ Run<span className="wide"> tests</span></>}
          </button>
        </div>
      </header>

      <div className="body">
        <Sidebar current={exercise} progress={progress} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Description exercise={exercise} />

        <div className="workspace">
          <section className="pane editor-pane">
            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={fileTab === 'main'} onClick={() => setFileTab('main')}>
                {exercise.file}
              </button>
              {exercise.helpers.map((h) => (
                <button key={h.name} role="tab" aria-selected={fileTab === h.name} onClick={() => setFileTab(h.name)}>
                  {h.name} <small>read-only</small>
                </button>
              ))}
              {solutionRevealed && (
                <button role="tab" aria-selected={fileTab === 'solution'} onClick={() => setFileTab('solution')}>
                  Solution <small>read-only</small>
                </button>
              )}
            </div>
            {/* Your code stays mounted while another tab is shown, so switching
                back keeps the cursor, scroll position and undo history. */}
            <div className="editor" hidden={readOnly}>
              <CodeMirror
                key={exercise.id}
                value={code}
                theme="dark"
                height="100%"
                extensions={extensions}
                onChange={setCode}
                basicSetup={{ tabSize: 2 }}
              />
            </div>
            {readOnly && (
              <div className="editor">
                <CodeMirror
                  key={`${exercise.id}:${fileTab}`}
                  value={shown}
                  theme="dark"
                  height="100%"
                  extensions={readOnlyExtensions}
                  readOnly
                  editable={false}
                  basicSetup={{ tabSize: 2 }}
                />
              </div>
            )}
          </section>

          <section className="pane output-pane">
            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>
                Preview
              </button>
              <button role="tab" aria-selected={tab === 'tests'} onClick={() => setTab('tests')}>
                Test results
              </button>
            </div>
            <div className="output">
              {tab === 'tests' ? (
                <Results run={runs[exercise.id]} exercise={exercise} next={next} />
              ) : (
                <Preview key={exercise.id} exercise={exercise} code={code} />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
