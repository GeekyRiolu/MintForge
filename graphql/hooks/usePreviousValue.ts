import { useEffect,useRef } from 'react';

export function usePreviousValue() {
  const usePrevious = (value) => {
    const ref = useRef(value);
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  return {
    usePrevious: usePrevious
  };
}