import { decodeBase64, isBase64 } from 'utils/image';
import { processIPFSURL } from 'utils/ipfs';
import { getBaseUrl } from 'utils/isEnv';

import { ImageLoaderProps } from 'next/image';

/**
 * Generates a srcset for the given image URL using a set of predefined widths.
 * @param {string} url - The URL of the image to generate the srcset for.
 * @returns An object containing the src, srcs, and srcset for the image.
 */
export function generateSrcSet(url: string) {
  const widths = [256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];
  const encodedUrl = isBase64(url)
    ? url
    : `${getBaseUrl()}api/imageFetcher?url=${encodeURIComponent(processIPFSURL(url))}`;

  const srcs = widths.map((width) => {
    return isBase64(url) ? encodedUrl : `${encodedUrl} ${width}w`;
  });
  const srcset = srcs.join(', ');
  return { src: encodedUrl, srcs, srcset };
}

/**
 * Generates a random number between 0 and 3 to be used as an index for selecting a preloader.
 * @returns {number} - A random number between 0 and 3.
 */
export const generateRandomPreloader = () => {
  const index = Math.floor(Math.random() * (4));
  return index;
};

/**
 * A function that takes in an object of ImageLoaderProps and returns a URL string with
 * the specified parameters.
 * @param {ImageLoaderProps} src - The source of the image to be loaded.
 * @param {number} quality - The quality of the image to be loaded.
 * @param {number} width - The width of the image to be loaded.
 * @returns A URL string with the specified parameters.
 */
export function contentfulLoader({ src, quality, width }: ImageLoaderProps) {
  const url = new URL(`${src}`);
  url.searchParams.set('fm', 'webp');
  url.searchParams.set('w', width.toString());
  url.searchParams.set('q', quality ? quality.toString() : '75');
  return url.href;
}

/**
 * A function that returns the URL of an image to be loaded. If the image is an SVG and is hosted on nft.com,
 * the original URL is returned. Otherwise, the URL is passed through an imageFetcher API to resize the image.
 * @param {ImageLoaderProps} - An object containing the source URL and the desired width of the image.
 * @returns {string} - The URL of the image to be loaded.
 */
export function nftComCdnLoader({ src, width }: ImageLoaderProps) {
  const base64 = isBase64(src) ? decodeBase64(src) : false;
  return base64 ||
    `${getBaseUrl()}api/imageFetcher?url=${encodeURIComponent(processIPFSURL(src))}&width=${width || 300}`;
}

/**
 * Returns the URL for a static NFT image from the Composable CDN with the given width.
 * @param {ImageLoaderProps} props - An object containing the source URL and the desired width.
 * @returns {string} - The URL for the static NFT image with the given width.
 */
export const staticNftComCdnLoader = ({ src }: ImageLoaderProps) => {
  return `https://cdn.nft.com/client/${src}`;
};
