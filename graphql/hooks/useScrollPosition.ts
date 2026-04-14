import { useCallback, useEffect, useState } from 'react';

export function useScrollPosition() {
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);
  const [previousYScrollPosition, setPreviousYScrollPosition] = useState(0);

  const handleScroll = useCallback(() => {
    setCurrentScrollPosition(window.pageYOffset);
    setPreviousYScrollPosition(currentScrollPosition);
  }, [currentScrollPosition]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentScrollPosition, handleScroll, previousYScrollPosition]);
  return {
    currentScrollPosition
  };
}