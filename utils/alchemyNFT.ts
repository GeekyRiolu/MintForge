import { Maybe } from 'graphql/generated/types';

import { Doppler,getEnv } from './env';
import { getChainIdString } from './helpers';
import { getBaseUrl } from './isEnv';

import { BigNumber, BigNumberish } from 'ethers';

export async function getNftMetadata(
  contract: string,
  tokenId: BigNumberish,
  chainId: string | number,
) {
  const url = new URL(getBaseUrl() + 'api/alchemynft');
  url.searchParams.set('contractAddress', contract);
  url.searchParams.set('tokenId', BigNumber.from(tokenId).toString());
  url.searchParams.set('tokenType', 'erc721');
  url.searchParams.set('action', 'getNftMetadata');
  url.searchParams.set('chainId', String(chainId));
  const result = await fetch(url.toString()).then(res => res.json());
  return result;
}

export async function getNftsByContractAndOwner(
  owner: string,
  contract: string,
  chainId: string | number,
  pageKey: string | null,
) {
  const url = new URL(getBaseUrl() + 'api/alchemynft');
  url.searchParams.set('contractAddress', contract);
  url.searchParams.set('owner', owner);
  url.searchParams.set('action', 'getNfts');
  url.searchParams.set('chainId', String(chainId));
  url.searchParams.set('pageKey', pageKey);
  const result = await fetch(url.toString()).then(res => res.json());
  return result;
}

export async function getContractMetadata(
  contract: string,
  chainId?: Maybe<string | number>,
) {
  const url = new URL(getBaseUrl() + 'api/alchemynft');
  url.searchParams.set('contractAddress', contract);
  url.searchParams.set('action', 'getContractMetadata');
  url.searchParams.set('chainId', getChainIdString(chainId) ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID));
  const result = await fetch(url.toString()).then(res => res.json());
  return result;
}

export async function getNftsForCollection(
  contract: string,
  limit: number | null
) {
  const url = new URL(getBaseUrl() + 'api/alchemynft');
  url.searchParams.set('action', 'getNFTsForCollection');
  url.searchParams.set('contractAddress', contract);
  url.searchParams.set('limit', String(limit));
  const result = await fetch(url.toString()).then(res => res.json());
  return result;
}

export async function getFloorPrice(
  contract: string,
) {
  const url = new URL(getBaseUrl() + 'api/alchemynft');
  url.searchParams.set('action', 'getFloorPrice');
  url.searchParams.set('contractAddress', contract);
  const result = await fetch(url.toString()).then(res => res.json());
  return result;
}
