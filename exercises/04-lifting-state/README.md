# 04 · Lifting state up: accordion

**Stage:** 1 · State & props · **Level:** Warm-up · **Topic:** Props, callbacks & shared state · **File:** `Accordion.jsx`

**Builds on:** state from 01–03.  
**New here:** when siblings must stay in sync, the state moves **up** to their
parent. Children become *controlled*: they receive data via props and report
events via callback props. (This is also a common interview question on its own.)

## Requirements

`Accordion.jsx` has two exports.

### `export function AccordionItem({ title, content, isOpen, onToggle })`
- Renders a `<button>` whose text is `title`, with `aria-expanded="true"` or
  `"false"` matching `isOpen`.
- Renders `content` **only** while `isOpen` is true.
- Clicking the button calls `onToggle()`.
- It has **no state of its own**: if the parent keeps passing `isOpen={false}`,
  it stays closed no matter how often it's clicked.

### `export default function Accordion({ items })`
where each item is `{ id, title, content }`.
- Renders one `AccordionItem` per item. All start closed.
- Clicking a closed item opens it **and closes whichever one was open** (at most
  one open at a time).
- Clicking the open item closes it.

## Check it

```bash
npm run check 4
```

<details><summary>Hint</summary>

The parent needs a single piece of state: `openId` (or `null`).
`isOpen={item.id === openId}` and
`onToggle={() => setOpenId(item.id === openId ? null : item.id)}`.
If you were tempted to give each item its own `useState(false)`, ask: how
would item A know that item B was just opened?
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Sharing state between components](https://react.dev/learn/sharing-state-between-components)
- [Passing props to a component](https://react.dev/learn/passing-props-to-a-component)
- [Conditional rendering](https://react.dev/learn/conditional-rendering)
- [Responding to events](https://react.dev/learn/responding-to-events)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** several components must agree on one fact ("which panel is open"), so that fact has to live in their common parent.

**Key concepts**

- **Single source of truth.** If each panel had its own `isOpen` state, opening B could not close A: components cannot read each other's state. Move the state to the closest common ancestor and pass it down.
- **Controlled vs uncontrolled components.** `AccordionItem` is *controlled*: it shows what the `isOpen` prop says and reports clicks through `onToggle`. It makes no decisions. That is why the grader checks that it stays closed when the parent keeps passing `false`.
- **Data down, events up.** Props flow from parent to child; the child asks for changes by calling a function it was given.
- **Store the minimum.** The parent stores one value, `openId`, rather than a boolean per item. "At most one open" is then guaranteed by the *shape* of the state: an invalid state cannot be represented.

**How the solution works**

`Accordion` holds `const [openId, setOpenId] = useState(null)`. Each item gets `isOpen={item.id === openId}` and an `onToggle` that sets `openId` to that item's id, or back to `null` if it was already open. `AccordionItem` renders a button with `aria-expanded` and conditionally renders the content with `{isOpen && ...}`.

**What an interviewer is looking for**

That you choose where state lives on purpose, and that you can turn "at most one open" into a state shape instead of into checks scattered through handlers.
</details>
