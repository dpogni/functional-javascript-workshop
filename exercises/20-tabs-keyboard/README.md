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
