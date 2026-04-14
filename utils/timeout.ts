/**
 * Returns a promise that resolves after the given number of milliseconds.
 * @param {number} ms - The number of milliseconds to wait before resolving the promise.
 * @returns A promise that resolves after the given number of milliseconds.
 */
export default function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
