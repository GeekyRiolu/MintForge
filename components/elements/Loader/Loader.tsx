import { cl } from 'utils/tw';

import { SVGProps } from 'react';

interface LoaderProps extends SVGProps<any> {
  /**
   *The size of the loader.
  */
  size?: string;
  /**
   * The color of the loader's stroke.
   */
  stroke?: string;
  /**
  * Provides title to loading svg
  */
  title?: string;
}

/**
 * A loader component that displays a spinning SVG icon.
 * @param {string} [size='h-4'] - The size of the loader.
 * @param {string | null} stroke - The color of the loader stroke.
 * @param {string} title - The title of the loader.
 * @param {LoaderProps} rest - Additional props to pass to the component.
 * @returns A spinning SVG icon that can be used as a loader.
 */
export default function Loader({
  size = 'h-4',
  stroke = null,
  title,
  ...rest
}: LoaderProps) {
  return (
    <svg
      className={cl('animate-spin-slow', size, stroke, { 'stroke-primary-1': !stroke })}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {title && <title>{title}</title>}
      <path
        stroke={stroke ?? '#0164d0'}
        // eslint-disable-next-line max-len
        d={'M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
