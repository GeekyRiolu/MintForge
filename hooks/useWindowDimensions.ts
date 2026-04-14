/**
 * credit to
 * https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs
 */

import { useEffect, useState } from 'react';

type WindowDimensions = { width?: number, height?: number }

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: undefined,
    height: undefined,
  });

  function handleResize() {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  return windowDimensions;
}
