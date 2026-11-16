import { useCallback, useState } from 'react';

export default function useToggle(initial = false) {
  const [on, setValue] = useState(initial);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setOn = useCallback(() => setValue(true), []);
  const setOff = useCallback(() => setValue(false), []);

  return { on, toggle, setOn, setOff };
}
