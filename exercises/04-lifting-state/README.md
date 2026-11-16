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
