import { useCallback, useState } from 'react';

/**
 * A custom React hook that returns a boolean state and a function to toggle the state.
 * @param {boolean} [initialState=false] - The initial state of the toggle.
 * @returns {[boolean, function]} - An array containing the current state and a function to toggle the state.
 */
export const useToggle = (initialState = false): [boolean, any] => {
  const [state, setState] = useState<boolean>(initialState);
  // memoize toggle function (returns opposite of current state)
  const toggle = useCallback((): void => setState(state => !state), []);
  return [state, toggle];
};
