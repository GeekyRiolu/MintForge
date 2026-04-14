'use client';
import { ReactNode, useEffect,useState } from 'react';

interface ClientOnlyProps {
  children: ReactNode
}

/**
 * Utility wrapper component for resolving client/server hydration conflict errors
 * that renders its children only if the page has mounted.
 * @param {ReactNode} children - the children to render if the page has mounted.
 * @returns None
 */
const ClientOnly:React.FC<ClientOnlyProps> = ({ children, ...delegated }) => {
  // State / Props
  const [hasMounted, setHasMounted] = useState(false);

  // Hooks
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Render
  if (!hasMounted) return null;

  return (
    <div {...delegated}>
      {children}
    </div>
  );
};

export default ClientOnly;
