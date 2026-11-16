import { renderHook } from '@testing-library/react';
import useDocumentTitle from '@ex/11-effect-basics/useDocumentTitle.js';

beforeEach(() => {
  document.title = 'Original';
});

const setup = (title) =>
  renderHook(({ title }) => useDocumentTitle(title), { initialProps: { title } });

describe('11 · useEffect with cleanup: useDocumentTitle', () => {
  test('sets document.title on mount', () => {
    setup('Inbox (3)');
    expect(document.title).toBe('Inbox (3)');
  });

  test('updates document.title when the title changes', () => {
    const { rerender } = setup('Inbox (3)');
    rerender({ title: 'Inbox (4)' });
    expect(document.title).toBe('Inbox (4)');
    rerender({ title: 'Inbox' });
    expect(document.title).toBe('Inbox');
  });

  test('restores the original title on unmount', () => {
    const { unmount } = setup('Inbox (3)');
    unmount();
    expect(document.title).toBe('Original');
  });

  test('restores the title from before mount, not an intermediate one', () => {
    const { rerender, unmount } = setup('One');
    rerender({ title: 'Two' });
    rerender({ title: 'Three' });
    unmount();
    expect(document.title).toBe('Original');
  });

  test('does not write document.title when the title is unchanged', () => {
    const { rerender } = setup('Stable');
    // Something else changes the title; an unrelated re-render must not clobber it.
    document.title = 'Changed elsewhere';
    rerender({ title: 'Stable' });
    rerender({ title: 'Stable' });
    expect(document.title).toBe('Changed elsewhere');
  });

  test('returns nothing', () => {
    const { result } = setup('x');
    expect(result.current).toBeUndefined();
  });
});
