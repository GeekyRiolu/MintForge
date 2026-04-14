import { Maybe } from 'graphql/generated/types';

import { base32cid, cid, multihash } from 'is-ipfs';

/**
 * Extracts the IPFS hash and path from a given URL.
 * @param {string} url - The URL to extract the IPFS hash and path from.
 * @returns {string | null} - The IPFS hash and path, or null if not found.
 */
export function extractIPFSHashAndPathFromUrl(url: string): string | null {
  // Define a regular expression pattern to match the IPFS hash format
  // and capture any subsequent path after the hash.
  const ipfsHashPattern = /(Qm[a-zA-Z0-9]{44}(\/.*)?)/;

  // Find the match in the URL
  const match = url.match(ipfsHashPattern);
/**
 * Processes an IPFS URL and returns a formatted URL with the correct prefix.
 * @param {Maybe<string>} image - The IPFS URL to process.
 * @returns {Maybe<string>} - The formatted URL with the correct prefix or null if the input is null.
 */

  // Return the matched IPFS hash and path or null if not found
  return match ? match[0] : null;
}

export const processIPFSURL = (image: Maybe<string>): Maybe<string> => {
  const prefix = 'https://nft-llc.mypinata.cloud/ipfs/';
  if (image == null) {
    return null;
  } else if (image.indexOf('ipfs://ipfs/') === 0) {
    return prefix + image.slice(12);
  } else if (image.indexOf('ipfs://') === 0) {
    return prefix + image.slice(7);
  } else if (image.indexOf('https://ipfs.io/ipfs/') === 0) {
    return prefix + image.slice(21);
  } else if (image.indexOf('https://ipfs.infura.io/ipfs/') === 0) {
    return prefix + image.slice(28);
  } else if (image.indexOf('https://gateway.pinata.cloud/ipfs/') === 0) {
    return prefix + image.slice(34);
  } else if (image.indexOf('https://infura-ipfs.io/ipfs/') === 0) {
    return prefix + image.slice(28);
  } else if (image.includes('ipfs')) {
    return prefix + extractIPFSHashAndPathFromUrl(image);
  } else if (base32cid(image) || multihash(image) || cid(image)) {
    return prefix + image;
  }
  return image;
};
