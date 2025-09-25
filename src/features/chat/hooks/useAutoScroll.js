import { useEffect, useRef } from 'react';

export function useAutoScroll(deps = []) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return endRef;
}