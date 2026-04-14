
/**
 * Checks if the code is running on the client side or server side.
 * @returns {boolean} - true if the code is running on the client side, false otherwise.
 */
export const isClient = typeof window !== 'undefined';
