import { AuctionType, MarketplaceAsset, Maybe, Scalars, Signature } from 'graphql/generated/types';

import { BigNumberish, BytesLike } from 'ethers';

export type MarketAsk = {
  __typename?: 'MarketAsk';
  approvalTxHash?: Maybe<Scalars['String']>;
  auctionType: AuctionType;
  buyNowTaker?: Maybe<Scalars['String']>;
  cancelTxHash?: Maybe<Scalars['String']>;
  chainId: Scalars['String'];
  end: Scalars['Int'];
  id: Scalars['ID'];
  makeAsset?: Maybe<Array<MarketplaceAsset>>;
  makerAddress: Scalars['Address'];
  marketSwapId?: Maybe<Scalars['String']>;
  nonce: Scalars['Int'];
  offerAcceptedAt?: Maybe<Scalars['DateTime']>;
  salt: Scalars['Int'];
  signature: Signature;
  start: Scalars['Int'];
  structHash: Scalars['String'];
  takeAsset?: Maybe<Array<MarketplaceAsset>>;
  takerAddress: Scalars['Address'];
};

export type AssetTypeStruct = { assetClass: BytesLike; data: BytesLike };

export type AssetStruct = { assetType: AssetTypeStruct; data: BytesLike };

export type OrderStruct = {
  maker: string;
  makeAssets: AssetStruct[];
  taker: string;
  takeAssets: AssetStruct[];
  salt: BigNumberish;
  start: BigNumberish;
  end: BigNumberish;
  nonce: BigNumberish;
  auctionType: BigNumberish;
};
