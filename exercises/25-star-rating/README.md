# 25 · Star rating

**Stage:** 8 · Interview classics · **Level:** Beginner · **Topic:** Hover state & event handlers · **File:** `StarRating.jsx` · ★ Interview problem

**Builds on:** state (01), derived values (02), event handlers on a list of elements (03).  
**New here:** two pieces of state that compete for the same pixels: the
*committed* rating and a temporary *hover preview*, and deciding which one wins.

A staple of machine-coding rounds: small enough for 20 minutes, with just
enough edge cases to show how you think about state.

## Requirements

`export default function StarRating({ max = 5, initialRating = 0, onChange })`

**Markup**
- A container with `role="group"` and `aria-label="Rating"`.
- `max` star buttons inside it. Their accessible names are `1 star`,
  `2 stars`, `3 stars`... (use `aria-label`).
- Every star has `data-filled="true"` or `data-filled="false"`. Show it visually
  too (for example ★ and ☆).
- An element with `data-testid="rating-label"` showing `3 out of 5` for the
  committed rating, or `No rating` when it is 0.

**Behaviour**
- Starts at `initialRating`: stars `1..initialRating` are filled.
- Clicking star *n* sets the rating to *n* and calls `onChange(n)`.
- Clicking the star that equals the current rating **clears** it to 0 and calls
  `onChange(0)`.
- Hovering star *n* *previews* it: stars `1..n` are filled, even if *n* is
  lower than the rating. Hovering does **not** change the rating, the label, or
  call `onChange`.
- When the pointer leaves the group, the stars show the committed rating again.
- Works from the keyboard: Tab to a star and press Enter or Space to choose it.

## Check it

```bash
npm run check 25
```

<details><summary>Hint</summary>

Keep two numbers in state: `rating` and `hover` (0 = not hovering). What's
drawn is `const shown = hover || rating`. Each star gets
`onMouseEnter={() => setHover(n)}` and `onClick={() => select(n)}`; the group
gets `onMouseLeave={() => setHover(0)}`. Real `<button>`s give you keyboard
support for free.
</details>

<details><summary>Topics to read (official React docs)</summary>

- [Responding to events](https://react.dev/learn/responding-to-events)
- [State: a component's memory](https://react.dev/learn/state-a-components-memory)
- [Choosing the state structure (avoid redundant state)](https://react.dev/learn/choosing-the-state-structure)
- [Rendering lists (and why keys matter)](https://react.dev/learn/rendering-lists)
</details>

<details><summary>Full explainer (spoilers)</summary>

**The problem in one line:** draw *n* stars where what you see depends on two
things at once: what the user chose, and where the pointer is right now.

**Key concepts**

- **Two kinds of state.** `rating` is the real value: it survives, it is
  reported to the parent, and the label shows it. `hover` is transient UI state:
  it exists only while the pointer is over a star. Mixing them into one variable
  is the classic bug: hovering would overwrite the rating, and leaving the group
  would have nothing to go back to.
- **Derive what you draw.** `const shown = hover || rating` (0 is falsy, so "not
  hovering" falls through to the rating). Star *n* is filled when
  `n <= shown`. There is no third piece of state like `filledCount`.
- **Generate elements from a number.** `Array.from({ length: max }, (_, i) => i + 1)`
  gives `[1, 2, ..., max]`. The star's number is a fine `key` because the list
  never reorders.
- **Where the leave handler goes.** Putting `onMouseLeave` on the group, not on
  each star, means moving from star 3 to star 4 never flickers back to the
  rating in between.

**How the solution works**

```js
const [rating, setRating] = useState(initialRating);
const [hover, setHover] = useState(0);
const shown = hover || rating;

const select = (n) => {
  const next = n === rating ? 0 : n;   // click the current rating to clear it
  setRating(next);
  onChange?.(next);
};
```

`onChange` is called from the event handler with the value just computed, not
from an effect that watches `rating`. That keeps it to exactly one call per
click and none on mount.

**Accessibility**

Native `<button>`s are focusable and fire `click` on Enter and Space, so
keyboard support needs no extra code. Each star needs an `aria-label`, because
"★" means nothing to a screen reader. A production version might use a radio
group (`role="radiogroup"` with arrow-key navigation, like the tabs in 20).

**Common follow-ups**

- *Half stars:* compare the pointer's `offsetX` with half the star's width.
- *Controlled version:* accept `value` instead of `initialRating` and let the
  parent own the rating (exercise 04's pattern).
- *Read-only mode:* render spans instead of buttons and skip the handlers.
</details>
