import { useEffect, useLayoutEffect, useRef } from 'react';

export default function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  // Always point at the latest callback, without touching the timer.
  useLayoutEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (delay === null || delay === undefined) return undefined;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
