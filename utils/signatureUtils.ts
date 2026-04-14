import { AssetClass } from 'graphql/generated/types';

import { isNullOrEmpty } from './format';

import {
  defaultAbiCoder,
  keccak256,
  toUtf8Bytes
} from 'ethers/lib/utils';

export const convertToHash = (text: string) => {
  if(isNullOrEmpty(text) ){
    return;
  }
  return keccak256(toUtf8Bytes(text));
};

export const ASSET_TYPEHASH = convertToHash(
  'Asset(AssetType assetType,bytes data)AssetType(bytes4 assetClass,bytes data)',
);
export const ASSET_TYPE_TYPEHASH = convertToHash(
  'AssetType(bytes4 assetClass,bytes data)'
);
export const MARKETPLACE_ORDER_TYPEHASH = convertToHash(
  // eslint-disable-next-line max-len
  'Order(address maker,Asset[] makeAssets,address taker,Asset[] takeAssets,uint256 salt,uint256 start,uint256 end,uint256 nonce,uint8 auctionType)Asset(AssetType assetType,bytes data)AssetType(bytes4 assetClass,bytes data)'
);

export const getHash = (types: string[], values: any[]): string => {
  return keccak256(defaultAbiCoder.encode(types, values));
};

export function encodeAssetClass(assetClass: AssetClass): string {
  switch (assetClass) {
  case AssetClass.Eth:
    return convertToHash('ETH').substring(0, 10);
  case AssetClass.Erc20:
    return convertToHash('ERC20').substring(0, 10);
  case AssetClass.Erc721:
    return convertToHash('ERC721').substring(0, 10);
  case AssetClass.Erc1155:
    return convertToHash('ERC1155').substring(0, 10);
  default:
    return '';
  }
}

export type UnhashedMarketplaceAsset = {
  class: AssetClass,
  types: string[],
  values: any[],
  data: any[]
}

export const getAssetBytes = (asset: UnhashedMarketplaceAsset): string => {
  return defaultAbiCoder.encode(['uint256', 'uint256'], asset.data);
};

export const getAssetTypeBytes = (
  asset: UnhashedMarketplaceAsset
): string => {
  return defaultAbiCoder.encode(asset.types, asset.values);
};

export const getAssetTypeHash = (
  asset: UnhashedMarketplaceAsset
): string => {
  return getHash(
    ['bytes32', 'bytes4', 'bytes32'],
    [ASSET_TYPE_TYPEHASH, encodeAssetClass(asset.class), getHash(asset.types, asset.values)]
  );
};

export const getAssetHash = (asset: UnhashedMarketplaceAsset): string => {
  return getHash(
    [
      'bytes32',
      'bytes32',
      'bytes32'
    ],
    [
      ASSET_TYPEHASH,
      getAssetTypeHash(asset),
      getHash(['uint256', 'uint256'], asset.data)
    ]
  );
};

export const getAssetHashForOrder = (assets: UnhashedMarketplaceAsset[]): string => {
  const assetList = [];
  const assetTypeList = [];

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const assetTypeHash = getAssetHash(asset);

    assetList.push(assetTypeHash);
    assetTypeList.push('bytes32');
  }

  return getHash(assetTypeList, assetList);
};

export const getOrderHash = (input: {
  maker: string,
  makeAssets: UnhashedMarketplaceAsset[],
  taker: string,
  takeAssets: UnhashedMarketplaceAsset[]
  salt: number,
  start: number,
  end: number,
  nonce: number,
  auctionType: number
}): string => {
  const makeAssetHash = getAssetHashForOrder(input.makeAssets);
  const takeAssetHash = getAssetHashForOrder(input.takeAssets);
  return getHash(
    [
      'bytes32',
      'address',
      'bytes32',
      'address',
      'bytes32',
      'uint256',
      'uint256',
      'uint256',
      'uint256',
      'uint8'
    ],
    [
      MARKETPLACE_ORDER_TYPEHASH,
      input.maker,
      makeAssetHash,
      input.taker,
      takeAssetHash,
      input.salt,
      input.start,
      input.end,
      input.nonce,
      input.auctionType
    ],
  );
};
