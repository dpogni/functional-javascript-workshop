import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  // Declared first so it captures the title *before* we overwrite it.
  // [] = set up once on mount, clean up once on unmount.
  useEffect(() => {
    const original = document.title;
    return () => {
      document.title = original;
    };
  }, []);

  // Re-runs only when `title` changes.
  useEffect(() => {
    document.title = title;
  }, [title]);
}
