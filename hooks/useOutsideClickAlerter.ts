import React, { useEffect } from 'react';

/**
 * Hook that alerts clicks outside of the passed ref
 * credit to: https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
 */
export function useOutsideClickAlerter(ref: React.RefObject<any>, onOutsideClick: () => void) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: Event) {
      if (ref?.current && !ref.current.contains(event.target)) {
        onOutsideClick();
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, onOutsideClick]);
}
