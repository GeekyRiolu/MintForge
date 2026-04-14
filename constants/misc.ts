import { AssetClass, NftType } from 'graphql/generated/types';

export const PROFILE_URI_LENGTH_LIMIT = 30;

export const NFT_TYPE_TO_ASSET_CLASS = {
  [NftType.Erc721] : AssetClass.Erc721,
  [NftType.Erc1155] : AssetClass.Erc1155,
};

export interface CHAIN_ID_TO_NETWORK_TYPE {
  1: string;
  3: string;
  5: string;
  42: string;
}

export const CHAIN_ID_TO_NETWORK : CHAIN_ID_TO_NETWORK_TYPE = {
  1: 'MAINNET',
  3: 'ROPSTEN',
  5: 'GOERLI',
  42: 'KOVAN',
};

export const ETHERSCAN_PREFIXES = {
  1: '',
  3: 'ropsten.',
  5: 'goerli.',
  42: 'kovan.',
};
