# 27 · Modal dialog

**Stage:** 8 · Interview classics · **Level:** Intermediate · **Topic:** Portals, focus & document events · **File:** `Modal.jsx` · ★ Interview problem

**Builds on:** DOM refs and focus (09), effects with cleanup (11), the
latest-callback-in-a-ref pattern (18).  
**New here:** rendering outside your parent's DOM with `createPortal`, listening
to events on `document`, and leaving the page exactly as you found it when the
dialog closes.

Interviewers like it because the happy path takes five minutes and the details
(focus, Escape, scroll lock, cleanup) show how much real UI you've built.

## Requirements

`export default function Modal({ isOpen, onClose, title, children })`

The parent owns `isOpen`; the modal asks to close by calling `onClose()`.

**Rendering**
- When `isOpen` is false, render nothing.
- When open, render into **`document.body`** with `createPortal` (not inside the
  parent's DOM), containing:
  - a backdrop element with `data-testid="modal-backdrop"`,
  - inside it, an element with `role="dialog"` and `aria-modal="true"`, named by
    its title: an `<h2>` holding `title`, connected with `aria-labelledby`,
  - `children`,
  - a close button with `aria-label="Close"`.

**Closing.** Each of these calls `onClose()`:
- the Close button,
- pressing `Escape` anywhere on the page,
- clicking the backdrop. Clicking **inside** the dialog must not.

**Focus and the page**
- On open, focus moves to the Close button.
- On close, focus returns to whatever was focused before it opened (usually
  the button that opened it).
- While open, `document.body.style.overflow` is `'hidden'` (the page behind
  can't scroll). On close, it goes back to whatever it was before.
- When closed, nothing is left listening: pressing Escape does not call
  `onClose`.
- If the parent re-renders while the modal is open (for example passing a new
  inline `onClose` function), focus must **not** jump around.

## Check it

```bash
npm run check 27
```

<details><summary>Hint</summary>

Do all the setup in **one** `useEffect` that runs when `isOpen` becomes true:
remember `document.activeElement` and `document.body.style.overflow`, set
overflow to hidden, focus the Close button through a ref, and add a `keydown`
listener to `document`. The cleanup undoes all four.

That effect should depend only on `[isOpen]`. To still call the *latest*
`onClose` from the Escape listener, keep it in a ref (exercise 18). For the
backdrop, close only when `e.target === e.currentTarget`.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [`createPortal` reference](https://react.dev/reference/react-dom/createPortal)
- [Manipulating the DOM with refs](https://react.dev/learn/manipulating-the-dom-with-refs)
- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
- [Separating events from effects](https://react.dev/learn/separating-events-from-effects)
- [`useId` reference](https://react.dev/reference/react/useId)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** draw something on top of the whole page, and
temporarily take over the keyboard, focus and scrolling, then hand them all back.

**Why a portal?**

If the modal rendered where it's declared, it would sit inside its parent's DOM
and inherit its CSS: `overflow: hidden` clips it, a `transform` or a stacking
context traps its `z-index`. `createPortal(jsx, document.body)` puts the DOM
nodes at the end of `<body>`, while the component stays where it is in the
*React* tree: it still gets props and context from its parent, and its events
still bubble through React parents.

**One effect, set up and torn down as a unit**

```js
useEffect(() => {
  if (!isOpen) return;
  const previouslyFocused = document.activeElement;
  const previousOverflow = document.body.style.overflow;

  document.body.style.overflow = 'hidden';
  closeButtonRef.current.focus();
  const onKeyDown = (e) => { if (e.key === 'Escape') onCloseRef.current(); };
  document.addEventListener('keydown', onKeyDown);

  return () => {
    document.removeEventListener('keydown', onKeyDown);
    document.body.style.overflow = previousOverflow;
    previouslyFocused?.focus();
  };
}, [isOpen]);
```

Each line of setup has a matching line of cleanup. The cleanup runs when
`isOpen` becomes false *and* when the modal unmounts while open, so you can't
leave the page locked in either case. Effects run after the portal's DOM exists,
so the ref is already filled in.

**Why `onClose` is read through a ref**

The parent probably writes `onClose={() => setOpen(false)}`: a new function on
every render. If the effect depended on `onClose`, every parent render would run
the cleanup (focus jumps back to the trigger) and then the setup (focus jumps to
Close). Users typing in a field inside the modal would lose focus mid-word.
Keeping `onClose` in a ref updated each render separates "when to set up"
(`isOpen`) from "what to call" (the latest `onClose`). React's `useEffectEvent`
is built for exactly this.

**Backdrop clicks**

A click inside the dialog bubbles up to the backdrop's `onClick`.
`e.target === e.currentTarget` is true only when the click landed on the
backdrop itself. (Calling `e.stopPropagation()` in the dialog also works, but
it stops other listeners from seeing the click.)

**Labelling**

`useId()` gives a stable id unique to this component instance, for
`aria-labelledby`. Hard-coding `id="modal-title"` breaks as soon as two modals
exist.

**What a production modal adds**

A **focus trap** (Tab from the last control wraps to the first, so focus can't
reach the page behind); `inert` on the rest of the page; animation; a stack, so
Escape closes only the top modal. The native `<dialog>` element with
`showModal()` gives you the trap, Escape and the backdrop for free, and is a
good thing to mention.
</details>
