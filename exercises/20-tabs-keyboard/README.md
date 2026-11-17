# 20 · Refs to many elements: keyboard-navigable tabs

**Stage:** 6 · Keyboard & focus · **Level:** Intermediate · **Topic:** Array of refs & moving focus · **File:** `Tabs.jsx`

**Builds on:** a single DOM ref (09) and `onKeyDown` (19).  
**New here:** keeping a ref to **each element in a list**, and moving focus
between them from a key handler. With this and 19 you have every piece the OTP
input (21) needs. (Tabs is also a classic interview component.)

## Requirements

`export default function Tabs({ tabs })` where each tab is `{ id, label, content }`.

**Markup**
- A container with `role="tablist"`.
- One `<button role="tab">` per tab, with text `label` and
  `aria-selected="true"` on the selected one (`"false"` on the others).
- The selected tab has `tabIndex={0}`; all others have `tabIndex={-1}`
  (so Tab-key users land on the active tab only).
- One element with `role="tabpanel"` showing the selected tab's `content`.

**Behaviour**
- The first tab is selected initially.
- Clicking a tab selects it.
- With focus on a tab, **ArrowRight** selects the next tab **and moves focus to
  it**; **ArrowLeft** does the same for the previous tab.
- Arrows wrap around: ArrowRight on the last tab goes to the first, ArrowLeft on
  the first goes to the last.

## Check it

```bash
npm run check 20
```

<details><summary>Hint</summary>

```js
const tabRefs = useRef([]);
...
<button ref={(el) => (tabRefs.current[i] = el)} ... />
```
In `onKeyDown`, compute `const next = (i + 1) % tabs.length` (or
`(i - 1 + tabs.length) % tabs.length`), then `setSelected(next)` and
`tabRefs.current[next].focus()`. Calling `.focus()` in the handler is fine;
the buttons already exist in the DOM.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Manipulating the DOM with refs](https://react.dev/learn/manipulating-the-dom-with-refs)
- [Responding to events](https://react.dev/learn/responding-to-events)
- [Conditional rendering](https://react.dev/learn/conditional-rendering)
- [Rendering lists (and why keys matter)](https://react.dev/learn/rendering-lists)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** one of several buttons is "selected", and arrow keys must move both the selection and the keyboard focus.

**Key concepts**

- **Selection is state; focus is a DOM command.** Which tab is selected determines what renders, so it is state. Moving the browser's focus is an instruction to a node: `node.focus()`. You need both.
- **Refs to a list of elements.** You cannot call `useRef` in a loop. Keep one ref holding an array and fill it with a ref callback: `ref={el => (tabRefs.current[i] = el)}`. React calls the callback with the node when it mounts and with `null` when it unmounts.
- **Wrap-around arithmetic.** Next is `(i + 1) % n`. Previous is `(i - 1 + n) % n`; adding `n` avoids `-1`, which `%` would leave negative in JavaScript.
- **Roving tabindex.** Only the selected tab has `tabIndex={0}`; the others have `-1`. The Tab key therefore enters the tab list once, on the active tab, and arrow keys move within it. This is the standard accessible pattern for tabs, toolbars and radio groups.

**How the solution works**

`selected` is an index in state. `onKeyDown` on each tab computes the target index for ArrowRight/ArrowLeft, calls `setSelected(next)` and `tabRefs.current[next].focus()`. Focusing in the handler is fine because all the tab buttons are already in the DOM; only the panel content changes. `aria-selected` and `tabIndex` are derived from `i === selected`, and one `role="tabpanel"` renders the selected content.

**Why this is the bridge to the OTP input**

The OTP input is the same structure with inputs instead of buttons: an array of refs, a key handler that works out a target index, and a `.focus()` call. Exercise 19 supplied the key handling; this one supplies the focus movement.

**Common mistakes**

Rendering every panel and hiding the others with CSS when the brief asks for one, forgetting to move focus so that selection and focus drift apart, and `document.querySelector` instead of refs.
</details>
