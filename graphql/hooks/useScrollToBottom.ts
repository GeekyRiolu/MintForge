import useWindowDimensions from 'hooks/useWindowDimensions';

import { useCallback, useEffect, useState } from 'react';

export function useScrollToBottom() {
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);
  const [previousYScrollPosition, setPreviousYScrollPosition] = useState(0);
  const [closeToBottom, setCloseToBottom] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  const handleScroll = useCallback(() => {
    let inactiveArea = screenWidth >= 900 ? document.body.scrollHeight*0.28 : document.body.scrollHeight*0.75;
    setCurrentScrollPosition(window.pageYOffset);
    setPreviousYScrollPosition(currentScrollPosition);
    if (currentScrollPosition > inactiveArea) {
      const scrollDirectionDown = previousYScrollPosition < currentScrollPosition;
      setCloseToBottom(currentScrollPosition > inactiveArea && scrollDirectionDown);
      setCurrentScrollPosition(0);
      inactiveArea = 0;
    } else {
      setCloseToBottom(false);
    }
  }, [screenWidth, currentScrollPosition, previousYScrollPosition]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentScrollPosition, handleScroll, previousYScrollPosition]);
  return {
    closeToBottom,
    currentScrollPosition
  };
}