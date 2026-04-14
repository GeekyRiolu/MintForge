import { useEffect, useLayoutEffect } from 'react';

/**
 * A custom hook that returns either the `useLayoutEffect` or `useEffect` hook depending on whether the code is being executed on the client or server.
 * @returns {Function} - Either the `useLayoutEffect` or `useEffect` hook.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
