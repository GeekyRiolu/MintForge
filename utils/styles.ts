export const HEADER_HEIGHT = '128px';

// split up for more fine tuned control.
export const TAB_BASE_CLASSES = [
  'cursor-pointer',
  'whitespace-nowrap',
  'font-medium',
  'text-sm',
];
export const TAB_ICON_EXTRA_CLASSES = ['h-7', 'w-7', 'text-gray-500'];
export const TAB_PADDING_CLASSES = ['py-4', 'pl-4'];
export const TAB_BOTTOM_BORDER_CLASSES = ['border-b-2'];
export const TAB_PINK_BORDER_CLASSES = ['border-pink-500'];
export const TAB_NO_BORDER_CLASSES = ['border-transparent'];

// all in one for basic usage
export const SELECTED_TAB_STYLE =
  'cursor-pointer border-pink-500 text-pink-600' +
  'whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm';
export const SELECTED_TAB_STYLE_NO_PADDING =
  'cursor-pointer border-pink-500 text-pink-600 whitespace-nowrap border-b-2 font-medium text-sm';
export const UNSELECTED_TAB_STYLE =
  'cursor-pointer border-transparent text-gray-500' +
  'hover:text-black hover:border-pink-500 whitespace-nowrap' +
  'py-4 px-3 border-b-2 font-medium text-sm';
export const UNSELECTED_TAB_STYLE_NO_PADDING =
  'cursor-pointer border-transparent text-gray-500' +
  'hover:text-black hover:border-pink-500 whitespace-nowrap' +
  'border-b-2 font-medium text-sm';

export function getUserTabStyle(active: boolean, isWalletSlideOpen: boolean) {
  if (active && !isWalletSlideOpen) {
    return SELECTED_TAB_STYLE;
  } else {
    return UNSELECTED_TAB_STYLE;
  }
}
const SELECTED_SUB_TAB_STYLE_DARK =
  'cursor-pointer border-blue-500 text-blue-500 font-bold whitespace-nowrap py-3 border-b-2';
const UNSELECTED_SUB_TAB_STYLE_DARK =
  'cursor-pointer border-transparent dark:text-primary-txt-dk text-primary-txt' +
  'hover:text-white whitespace-nowrap py-3 border-b-2';
const SELECTED_SUB_TAB_STYLE_LIGHT =
  'cursor-pointer border-blue-500 text-blue-500 font-bold whitespace-nowrap py-3 border-b-2';
const UNSELECTED_SUB_TAB_STYLE_LIGHT =
  'cursor-pointer border-transparent dark:text-primary-txt-dk text-primary-txt' +
  'hover:text-black whitespace-nowrap py-3 border-b-2';

export function getSubTabStyle(active: boolean, isDarkMode: boolean, defaultStyle?: boolean) {
  if (defaultStyle) {
    return `minmd:hover:text-black minmd:hover:dark:text-white whitespace-nowrap py-3 border-b-2 hover:cursor-pointer border-transparent
      ${active ? 'text-toggle-bg font-bold' : 'dark:text-primary-txt-dk text-gray-400 hover:font-bold'}`;
  }
  if (active) {
    return isDarkMode ? SELECTED_SUB_TAB_STYLE_DARK : SELECTED_SUB_TAB_STYLE_LIGHT;
  } else {
    return isDarkMode ? UNSELECTED_SUB_TAB_STYLE_DARK : UNSELECTED_SUB_TAB_STYLE_LIGHT;
  }
}
