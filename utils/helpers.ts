import { ETHERSCAN_PREFIXES } from 'constants/misc';
import { Collection, Maybe } from 'graphql/generated/types';

import { Doppler, getEnv } from './env';
import { isNullOrEmpty } from './format';

// TODO: split up ethers, ipfs, etc. utils into dynamically imported crypto util file
import { getAddress } from '@ethersproject/address';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { ethers } from 'ethers';
import { atom } from 'jotai';
import moment, { Moment } from 'moment';
import slugify from 'slugify';
import { PartialDeep } from 'type-fest';

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

export const profileSaveCounter = atom(0);

export function sameAddress(first: Maybe<string>, second: Maybe<string>) {
  if (first == null || second == null) {
    return false;
  }
  try {
    return ethers.utils.getAddress(first) === ethers.utils.getAddress(second);
  } catch (error) {
    return false;
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars?: number): string {
  const charsVal = chars || 6;
  const parsed = isAddress(address);
  if (!parsed) {
    return '';
  }
  return `${parsed.substring(0, charsVal + 2)}...${parsed.substring(42 - charsVal)}`;
}

/* ------------ helper function with option of overriding cdn use ----------- */
export const getStaticAsset = (imagePath: string, cdn = true): string => {
  if (cdn) return `https://cdn.nft.com/client/${imagePath}`;
  return imagePath;
};

export const formatID = (id: BigNumber) => {
  if (id.lt(10)) {
    return '0000' + id.toString();
  } else if (id.lt(100)) {
    return '000' + id.toString();
  } else if (id.lt(1000)) {
    return '00' + id.toString();
  } else if (id.lt(10000)) {
    return '0' + id.toString();
  } else {
    return id.toString();
  }
};

export const getGenesisKeyThumbnail: (id: BigNumberish) => string = (id: BigNumberish) => {
  if (BigNumber.from(id).gt(10000)) {
    return '';
  }
  return 'https://cdn.nft.com/gk-min/' + BigNumber.from(id).toString() + '.jpeg';
};

export function getEtherscanLink(
  chainId: number,
  data: string,
  type: 'transaction' | 'token' | 'address'
): string {
  const prefix = `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}etherscan.io`;

  switch (type) {
  case 'transaction': {
    return `${prefix}/tx/${data}`;
  }
  case 'token': {
    return `${prefix}/token/${data}`;
  }
  case 'address':
  default: {
    return `${prefix}/address/${data}`;
  }
  }
}

export function getChainIdString(chainId: Maybe<number | string>): Maybe<string> {
  return (chainId == null ? null : String(chainId));
}


/**
 * Calculates the number of items to display per page based on the screen width and whether or not the side navigation is open.
 * @param {string} index - the index of the page being displayed
 * @param {number} screenWidth - the width of the screen in pixels
 * @param {boolean} [sideNavOpen] - whether or not the side navigation is open
 * @returns {number} - the number of items to display per page
 */
export function getPerPage(index: string, screenWidth: number, sideNavOpen?: boolean): number {
  let perPage;

  if (index === 'collections') {
    if (screenWidth >= 1200) {
      perPage = sideNavOpen ? 9 : 12;
    } else if (screenWidth >= 900) {
      perPage = sideNavOpen ? 4 : 6;
    } else if (screenWidth >= 600) {
      perPage = 4;
    } else {
      perPage = 2;
    }
  } else if (index === 'discover') {
    if (screenWidth >= 1200) {
      perPage = sideNavOpen ? 9 : 8;
    } else if (screenWidth >= 900) {
      perPage = sideNavOpen ? 6 : 9;
    } else if (screenWidth >= 600) {
      perPage = 4;
    } else {
      perPage = 2;
    }
  } else if (index === 'discoverProfiles') {
    perPage = screenWidth > 1200 ? 20 : screenWidth > 900 && screenWidth <= 1200 ? 12 : screenWidth > 600 && screenWidth <= 900 ? 8 : 4;
  } else if (index === 'discoverNFTs') {
    perPage = !sideNavOpen ?
      screenWidth > 1200 ? 20 : screenWidth > 900 && screenWidth <= 1200 ? 12 : screenWidth > 600 && screenWidth <= 900 ? 8 : 4
      :
      (screenWidth > 1600 ? 20 : screenWidth > 1200 && screenWidth <= 1600 ? 15 : screenWidth > 600 && screenWidth <= 1200 ? 10 : 5);
  } else if (index === 'discoverCollections') {
    perPage = screenWidth > 1200 ? 18 : screenWidth > 600 && screenWidth <= 1200 ? 12 : 6;
  } else if (index === 'profilePage') {
    perPage = screenWidth > 1600 ? 24 : screenWidth > 1200 && screenWidth <= 1600 ? 20 : screenWidth > 900 && screenWidth <= 1200 ? 16 : screenWidth > 600 && screenWidth <= 900 ? 12 : 8;
  } else {
    if (screenWidth >= 1200) {
      perPage = sideNavOpen ? 9 : 12;
    } else if (screenWidth >= 900) {
      perPage = sideNavOpen ? 6 : 8;
    } else if (screenWidth >= 600) {
      perPage = 6;
    } else {
      perPage = 4;
    }
  }
  return perPage;
}

/**
 * Returns the maximum value from a list of BigNumberish values.
 * @param {...BigNumberish} args - The list of BigNumberish values to find the maximum from.
 * @returns The maximum value from the list of BigNumberish values, or null if the list is empty.
 */
export function max(...args: BigNumberish[]) {
  if (isNullOrEmpty(args)) {
    /**
 * Returns the minimum value from a list of BigNumberish values.
 * @param {...BigNumberish} args - The list of BigNumberish values to find the minimum from.
 * @returns The minimum value from the list of BigNumberish values, or null if the list is empty.
 */
    return null;
  }
  return args.reduce((acc, val) => BigNumber.from(acc ?? Number.MIN_VALUE).gt(val) ? acc : val);
}

export function min(...args: BigNumberish[]) {
  if (isNullOrEmpty(args)) {
    return null;
  }
  return args.reduce((acc, val) => BigNumber.from(acc ?? Number.MAX_VALUE).lt(val) ? acc : val);
}

export function fetcher(url: string): Promise<any> {
  return fetch(url).then((res) => res.json());
}

export function getDateFromTimeFrame(timeFrame: string): Moment {
  if (timeFrame === '1D') {
    return moment().subtract(1, 'd');
  }
  if (timeFrame === '7D') {
    return moment().subtract(7, 'd');
  }
  if (timeFrame === '1M') {
    return moment().subtract(1, 'M');
  }
  if (timeFrame === '3M') {
    return moment().subtract(3, 'M');
  }
  if (timeFrame === '1Y') {
    return moment().subtract(1, 'year');
  }
}

export const collectionCardImages = (collection: any) => {
  return [
    collection.nfts[0]?.metadata?.imageURL || collection.nfts[0]?.previewLink || collection.nfts[0]?.metadata?.traits?.find(i => i.type === 'image_url_png')?.value,
    collection.nfts[1]?.metadata?.imageURL || collection.nfts[1]?.previewLink || collection.nfts[1]?.metadata?.traits?.find(i => i.type === 'image_url_png')?.value,
    collection.nfts[2]?.metadata?.imageURL || collection.nfts[2]?.previewLink || collection.nfts[2]?.metadata?.traits?.find(i => i.type === 'image_url_png')?.value,
  ];
};

export const getBaseUrl = (override = '') => {
  return override || getEnv(Doppler.NEXT_PUBLIC_BASE_URL);
};

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
 * Determines if the given Collection is an official collection and returns the url slug of the collection name or contract.
 * @param {PartialDeep<Collection>} collection - The Collection item to check.
 * @returns {string} - The encoded name of the collection if it is official, otherwise the contract address of the item.
 */
export const isOfficialCollection = (collection: PartialDeep<Collection>) => collection?.isOfficial
  ? `official/${slugify(collection?.name, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
    trim: true,
    strict: true,
  })}`
  : collection?.contract;

/**
 * Simple check if the given string is a valid Ethereum contract address.
 * @param {string} contract - The contract address to validate.
 * @returns {boolean} - True if the contract address is valid, false otherwise.
 */
export const isValidContractSimple = (contract: string) => /^0x[a-fA-F0-9]{40}$/.test(contract);
