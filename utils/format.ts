import { Maybe } from 'graphql/generated/types';

/* -------------------------------------------------------------------------- */
/*                No Dependency - Formatting & Helper Utilities               */
/* -------------------------------------------------------------------------- */

/**
 * Determines if the current browser is Google Chrome.
 * @returns {boolean} - true if the browser is Chrome, false otherwise.
 */
export function isChromeBrowser() {
  let isChromeBrowser = false;
  if (typeof window !== 'undefined') {
    isChromeBrowser = window.navigator.userAgent.toString().toLocaleLowerCase().includes('chrome');
  }
  return isChromeBrowser;
}

/**
 * Takes in a number and returns a string representation of the number with commas
 * separating every three digits.
 * @param {number} x - the number to format
 * @returns A string representation of the number with commas separating every three digits.
 */
export function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Shortens a given Ethereum address by replacing the middle section with ellipses.
 * @param {string | null} address - The Ethereum address to shorten.
 * @param {boolean} mobile - A boolean indicating whether the address is being displayed on a mobile device.
 * @returns {string | null} - The shortened Ethereum address or null if the input address is null.
 */
export function shorten(address: string | null, mobile: boolean) {
  if (address == null) {
    return null;
  }
  return mobile
    ? address.substring(0, 7) + '...' + address.substring(35, 42)
    : address.substring(0, 10) + '...' + address.substring(32, 42);
}

/**
 * Shortens a string or number to a specified length and adds ellipsis if the length exceeds a limit.
 * @param {string | null | number} value - The value to shorten.
 * @param {number} limit - The maximum length of the value before it is shortened.
 * @param {number} length - The length to which the value should be shortened.
 * @returns {string | null | number} - The shortened value.
 */
export function shortenString(value: string | null | number, limit: number, length: number) {
  if (value == null) {
    return null;
  }
  return value.toString().length > limit ? value.toString().substring(0, length) + '...' : value;
}

/**
 * Formats a number or string to a more readable format with commas and a specified number of decimal places.
 * @param {number | string} num - the number or string to format
 * @param {number} [dec] - the number of decimal places to include in the formatted number
 * @returns {string} - the formatted number as a string
 */
export function prettify(num: number | string, dec?: number) {
  if (num === 0 || Number(num) < 0.001) {
    return '0';
  }

  if (Number(num) < 0.1) {
    return Number(num).toFixed(3);
  }

  let extra = 0;
  let formatted;

  while (formatted === '0' || formatted == null) {
    formatted = numberWithCommas(parseFloat(Number(num).toFixed(dec + extra)));
    extra++;
    if (extra > 5) {
      return numberWithCommas(parseFloat(Number(num).toFixed(dec)));
    }
  }
  return formatted;
}
/**
 * Converts a number value to an object with two properties, start and end, where start is the first n digits of the number
 * and end is the remaining digits of the number.
 * @param {number} value - The number to convert.
 * @param {number} first - The number of digits to include in the start property.
 * @param {number} second - The number of digits to include in the end property.
 * @returns An object with two properties, start and end.
 */
export const convertValue = (value: number, first: number, second: number) => {
  const start = value.toString().slice(0, first);
  const end = value.toString().slice(first, second);
  return {
    start,
    end
  };
};
/**
 * Joins multiple class names together into a single string, separated by a space.
 * Any null or undefined values are filtered out before joining.
 * @param {...string} args - The class names to join together.
 * @returns A string of class names separated by a space.
 */
export const joinClasses = (...args: string[]) => filterNulls(args).join(' ');

/**
 * Checks if the given value is null, undefined, an empty string, or an empty array.
 * @param {string | any[] | null | undefined} val - The value to check.
 * @returns {boolean} - True if the value is null, undefined, an empty string, or an empty array, false otherwise.
 */
export const isNullOrEmpty = (val: string | any[] | null | undefined) => val == null || val.length === 0;

/**
 * Checks if the given value is null or undefined.
 * @param {string | any[] | null | undefined} val - The value to check.
 * @returns {boolean} True if the value is null or undefined, false otherwise.
 */
export const isNull = (val: string | any[] | null | undefined) => val == null;

/**
 * Checks if the given object is empty or null/undefined.
 * @param {Record<string, unknown> | null | undefined} obj - The object to check.
 * @returns {boolean} True if the object is empty or null/undefined, false otherwise.
 */
export const isObjEmpty = (obj: Record<string, unknown> | null | undefined) => obj == null || Object.keys(obj).length === 0;

/**
 * Filters out null and undefined values from an array of items.
 * @param {Maybe<T>[]} items - An array of items that may contain null or undefined values.
 * @returns {T[]} An array of items with null and undefined values removed.
 * @template T
 */
export const filterNulls = <T>(items: Maybe<T>[]): T[] => items.filter(item => item != null);

/**
 * Filters out duplicate items from an array based on a given comparison function.
 * @param {T[]} items - The array of items to filter.
 * @param {(first: T, second: T) => boolean} isSame - The comparison function to determine if two items are the same.
 * @returns {T[]} A new array with duplicates removed.
 */
export const filterDuplicates = <T>(items: T[], isSame: (first: T, second: T) => boolean): T[] => {
  return items.filter((item, index) => items.findIndex((element) => isSame(item, element)) === index);
};

/**
 * Slices a given string to a maximum count and adds ellipsis if the string is cut.
 * @param {string} description - The string to be sliced.
 * @param {number} maxCount - The maximum number of characters to keep in the string.
 * @param {boolean} isStringCut - A boolean indicating whether the string has already been cut.
 * @returns The sliced string with ellipsis if the string is cut.
 */
export const sliceString = (description: string, maxCount: number, isStringCut: boolean) => {
  if (!description) return;
  let newDescription;
  if (description?.length > maxCount) {
    const newString = description?.slice(0, !isStringCut ? maxCount : description?.length);
    newDescription = !isStringCut ? `${newString}...` : newString;
  } else {
    newDescription = description;
  }
  return newDescription;
};

/**
 * Returns a string representation of the given chain ID.
 * @param {Maybe<number | string>} chainId - The chain ID to convert to a string.
 * @returns {Maybe<string>} - The string representation of the chain ID, or null if the input is null or undefined.
 */
export function getChainIdString(chainId: Maybe<number | string>): Maybe<string> {
  return (chainId == null ? null : String(chainId));
}

/**
 * Checks if the given parameter is a string.
 * @param {any} str - the parameter to check
 * @returns {boolean} - true if the parameter is a string, false otherwise.
 */
export const isString = (str: any) => typeof str === 'string' || str instanceof String;
