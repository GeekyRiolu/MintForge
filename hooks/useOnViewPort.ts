import { useEffect, useState } from 'react';

export default function useOnViewPort(ref: React.MutableRefObject<undefined>, threshold: number) {
  const [isVisible, setState] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setState(entry.isIntersecting);
      },{ rootMargin: '0px', threshold }
    );

    element && observer.observe(element);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return [isVisible];
}
