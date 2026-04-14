import { joinClasses } from 'utils/format';

import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function tw(...args: string[]) {
  return joinClasses(...args);
}

/**
 * Takes in a list of class values and merges them into a single class string (Note will remove duplicates or conflicting classes)
 * @param {ClassValue[]} inputs - the list of class values to merge
 * @returns {string} the merged class string
 * @example cl('h-full', {'border': true, 'border-red': isErrorBorder })
 * @example cl('h-full', isFullWidth && 'w-full') // 'h-full w-full' || 'h-full'
 * @example cl('h-full', 'h-full') // 'h-full'
 * @example cl('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]') // → 'hover:bg-dark-red p-3 bg-[#B91C1C]'
 *
 */
export const cl = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
