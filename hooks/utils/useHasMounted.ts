import { useEffect, useState } from 'react';

/**
 * Utility react hook to help resolve client/server hydration conflicts,
 * returns true if the component has mounted.
 * @returns {boolean} - True if the component has mounted.
 */
export default function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}
