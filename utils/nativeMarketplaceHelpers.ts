import { StagedPurchase } from 'components/modules/Checkout/NFTPurchaseContext';
import { NULL_ADDRESS } from 'constants/addresses';
import { NFT_TYPE_TO_ASSET_CLASS } from 'constants/misc';
import { Marketplace } from 'constants/typechain';
import {
  AssetClass,
  AssetType,
  AuctionType,
  MarketplaceAsset,
  MarketplaceAssetInput,
  Nft,
  NftcomProtocolData,
  TxActivity
}
  from 'graphql/generated/types';
import { AggregatorResponse } from 'types';
import { AssetStruct, AssetTypeStruct, MarketAsk, OrderStruct } from 'types/nativeMarketplace';

import { isNullOrEmpty } from './format';
import { getBaseUrl } from './isEnv';
import { libraryCall, NFTCOMLib } from './marketplaceHelpers';
import { encodeAssetClass, getAssetBytes, getAssetTypeBytes } from './signatureUtils';

import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { SignTypedDataArgs } from '@wagmi/core';
import { ethers, Signature } from 'ethers';
import moment from 'moment';
import { PartialDeep } from 'type-fest';
import { PartialObjectDeep } from 'type-fest/source/partial-deep';
import { Address } from 'wagmi';

export const MAX_UINT_256 = BigNumber.from(2).pow(256).sub(1);
export const DEPLOYER = '0x59495589849423692778a8c5aaCA62CA80f875a4';
export const isNFT = (assetClass: AssetClass) => {
  return assetClass === AssetClass.Erc1155 || assetClass === AssetClass.Erc721;
};

export const formatCurrency = (
  amount: BigNumber,
  units?: number
): string => {
  if (amount == null) {
    return '';
  } else {
    return ethers.utils.formatUnits(amount, units ?? 18);
  }
};

const marketplaceAssetTypeToAssetTypeStruct = (
  assetType: AssetType
): AssetTypeStruct => {
  return {
    assetClass: encodeAssetClass(assetType.assetClass),
    data: assetType.bytes
  };
};

const marketplaceAssetToAssetStruct = (
  asset: MarketplaceAsset
): AssetStruct => {
  return {
    assetType: marketplaceAssetTypeToAssetTypeStruct(asset.standard),
    data: asset.bytes
  };
};

export const marketAskToOrderStruct = (
  ask: PartialDeep<MarketAsk>
): OrderStruct | null => {
  const makeAssetStructs = ask.makeAsset?.map(marketplaceAssetToAssetStruct);
  const takeAssetStructs = ask.takeAsset?.map(marketplaceAssetToAssetStruct);
  if (
    ask.auctionType == null ||
    ask.nonce == null ||
    ask.start == null ||
    ask.end == null ||
    ask.salt == null ||
    ask.makeAsset == null ||
    ask.takeAsset == null ||
    makeAssetStructs == null ||
    takeAssetStructs == null
  ) {
    return null;
  }
  return {
    auctionType: gqlAuctionTypeToOnchainAuctionType(ask.auctionType),
    nonce: ask.nonce,
    end: ask.end,
    start: ask.start,
    salt: ask.salt,
    maker: ask.makerAddress,
    taker: ask.takerAddress,
    makeAssets: makeAssetStructs,
    takeAssets: takeAssetStructs
  };
};

// export const marketBidToOrderStruct = (
//   bid: PartialDeep<MarketBid>
// ): OrderStruct | null => {
//   const makeAssetStructs = bid.makeAsset?.map(marketplaceAssetToAssetStruct);
//   const takeAssetStructs = bid.takeAsset?.map(marketplaceAssetToAssetStruct);
//   if (
//     bid.auctionType == null ||
//     bid.nonce == null ||
//     bid.start == null ||
//     bid.end == null ||
//     bid.salt == null ||
//     bid.makeAsset == null ||
//     bid.takeAsset == null ||
//     makeAssetStructs == null ||
//     takeAssetStructs == null
//   ) {
//     return null;
//   }
//   return {
//     auctionType: gqlAuctionTypeToOnchainAuctionType(bid.auctionType),
//     nonce: bid.nonce,
//     end: bid.end,
//     start: bid.start,
//     salt: bid.salt,
//     maker: bid.makerAddress,
//     taker: bid.takerAddress,
//     makeAssets: makeAssetStructs,
//     takeAssets: takeAssetStructs
//   };
// };

// export const orderStructToTuple = (
//   order: OrderStruct //need order type
// ): any[] => {
//   return [
//     order.maker,
//     order.makeAssets.map(asset => ([
//       [asset.assetType.assetClass, asset.assetType.data],
//       asset.data
//     ])),
//     order.taker,
//     order.takeAssets.map(asset => ([
//       [asset.assetType.assetClass, asset.assetType.data],
//       asset.data
//     ])),
//     order.salt,
//     order.start,
//     order.end,
//     order.nonce,
//     order.auctionType
//   ];
// };

// export const canBuyNow = (
//   ask: PartialDeep<MarketAsk>
// ): boolean => {
//   // Fixed and Decreasing Price sales can always be bought now.
//   // English auctions must have a buy now price specified (`value` field)
//   return ask.auctionType === AuctionType.FixedPrice ||
//     ask.auctionType === AuctionType.Decreasing ||
//     (ask.auctionType === AuctionType.English &&
//       MAX_UINT_256.gt(ask.takeAsset?.[0]?.value));
// };

export const getNftcomHex = async (
  protocolData: NftcomProtocolData & { orderSignature: Signature },
  ethValue: string,
  orderHash: string,
  makerAddress: string,
  takerAddress: string,
  id: string,
  chainId: string,
  nonce: number,
  recipient: Address
): Promise<AggregatorResponse> => {
  try {
    const {
      salt,
      makeAsset,
      takeAsset,
      start,
      end,
      auctionType,
      orderSignature: signature,
      buyNowTaker,
    } = protocolData;

    const order = {
      auctionType,
      buyNowTaker,
      chainId,
      end,
      id,
      makeAsset,
      makerAddress,
      nonce,
      salt,
      signature: {
        r: signature.r,
        s: signature.s,
        v: signature.v
      },
      start,
      structHash: orderHash,
      takeAsset,
      takerAddress
    };
    const sellOrder = marketAskToOrderStruct(order);
    const failIfRevert = true;
    const inputData = [[sellOrder, recipient, signature.v, signature.r, signature.s], BigNumber.from(ethValue), failIfRevert];
    const wholeHex = await NFTCOMLib.encodeFunctionData('_buySwap', inputData);
    const genHex = libraryCall('_buySwap(BuyNowParams,uint256,bool)', wholeHex.slice(10));

    return {
      tradeData: genHex,
      value: BigNumber.from(ethValue),
      marketId: '5',
    };
  } catch (err) {
    throw `error in getNFTCOMHex: ${err}`;
  }
};

export const gqlAuctionTypeToOnchainAuctionType = (
  auctionType: AuctionType
): number => {
  return [
    AuctionType.FixedPrice,
    AuctionType.English,
    AuctionType.Decreasing
  ].indexOf(auctionType);
};

export const onchainAuctionTypeToGqlAuctionType = (
  auctionType: number
): AuctionType => {
  const auctions = [
    AuctionType.FixedPrice,
    AuctionType.English,
    AuctionType.Decreasing
  ];

  return auctions[auctionType];
};

export type SaleDuration = '1 Day' | '3 Days' | '1 Week' | 'Forever';

export const getDurationToMs = (d: SaleDuration) => {
  const durationDays: { [s in SaleDuration]: number } = {
    '1 Day': 1,
    '3 Days': 3,
    '1 Week': 7,
    'Forever': 0
  };
  return 1000 * 60 * 60 * 24 * durationDays[d];
};

export type UnhashedAsset = {
  class: AssetClass,
  // types and values must match up
  types: string[],
  values: any[],
  data: [BigNumber, BigNumber]
}

export type UnsignedOrder = {
  maker: string,
  taker: string,
  salt: number,
  start: number,
  end: number,
  nonce: number,
  auctionType: number,
  makeAssets: Array<{
    data: string,
    assetType: {
      assetClass: string,
      data: string
    }
  }>,
  takeAssets: Array<{
    data: string,
    assetType: {
      assetClass: string,
      data: string
    }
  }>
}

export const getUnhashedAsset = (
  assetClass: AssetClass,
  value: BigNumber,
  minimumBid: BigNumber,
  contract: string,
  tokenId: BigNumber,
  allowAll: boolean,
): UnhashedAsset => {
  if (assetClass === AssetClass.Erc20 || assetClass === AssetClass.Eth) {
    return {
      class: assetClass,
      // types and values must match up
      types: ['address'],
      values: [contract],
      data: [value, minimumBid]
    };
  } else {
    return {
      class: assetClass,
      // types and values must match up
      types: ['address', 'uint256', 'bool'],
      values: [contract, tokenId, allowAll],
      data: [value, minimumBid]
    };
  }
};

export const getUnsignedOrder = (
  maker: string,
  taker: string,
  salt: number,
  start: number,
  end: number,
  nonce: number,
  auctionType: AuctionType,
  makeAssets: UnhashedAsset[],
  takeAssets: UnhashedAsset[]
): UnsignedOrder => {
  return {
    maker,
    taker,
    salt: salt,
    start: start,
    end: end,
    nonce: nonce,
    auctionType: gqlAuctionTypeToOnchainAuctionType(auctionType),
    makeAssets: makeAssets.map(unhashedMakeAsset => {
      return {
        data: getAssetBytes(unhashedMakeAsset),
        assetType: {
          data: getAssetTypeBytes(unhashedMakeAsset),
          assetClass: encodeAssetClass(unhashedMakeAsset.class)
        }
      };
    }),
    takeAssets: takeAssets.map(unhashedTakeAsset => {
      return {
        data: getAssetBytes(unhashedTakeAsset),
        assetType: {
          data: getAssetTypeBytes(unhashedTakeAsset),
          assetClass: encodeAssetClass(unhashedTakeAsset.class)
        }
      };
    })
  };
};

export const getMarketAskSignatureData = (
  chainId: string,
  verifyingContract: string,
  unsignedOrder: UnsignedOrder
): SignTypedDataArgs => {
  return {
    types: {
      Order: [
        { name: 'maker', type: 'address' },
        { name: 'makeAssets', type: 'Asset[]' },
        { name: 'taker', type: 'address' },
        { name: 'takeAssets', type: 'Asset[]' },
        { name: 'salt', type: 'uint256' },
        { name: 'start', type: 'uint256' },
        { name: 'end', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'auctionType', type: 'uint8' }
      ],
      Asset: [
        { name: 'assetType', type: 'AssetType' },
        { name: 'data', type: 'bytes' }
      ],
      AssetType: [
        { name: 'assetClass', type: 'bytes4' },
        { name: 'data', type: 'bytes' }
      ]
    },
    domain: {
      name: 'NFT.com Marketplace',
      version: '1',
      chainId,
      verifyingContract: verifyingContract as `0x${string}`,
    },
    value: unsignedOrder
  };
};

export const getMarketplaceAssetInput = (
  asset: UnhashedAsset,
  tokenId: BigNumberish,
  contractAddress: string
): MarketplaceAssetInput => {
  return {
    bytes: getAssetBytes(asset),
    value: asset.data[0],
    minimumBid: asset.data[1],
    standard: {
      allowAll: false,
      tokenId,
      contractAddress,
      bytes: getAssetTypeBytes(asset),
      assetClass: asset.class
    }
  };
};

export const getMarketBidSignatureData = (
  chainId: string,
  verifyingContract: string,
  unsignedOrder: UnsignedOrder
): SignTypedDataArgs => {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Order: [
        { name: 'maker', type: 'address' },
        { name: 'makeAssets', type: 'Asset[]' },
        { name: 'taker', type: 'address' },
        { name: 'takeAssets', type: 'Asset[]' },
        { name: 'salt', type: 'uint256' },
        { name: 'start', type: 'uint256' },
        { name: 'end', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'auctionType', type: 'uint8' }
      ],
      Asset: [
        { name: 'assetType', type: 'AssetType' },
        { name: 'data', type: 'bytes' }
      ],
      AssetType: [
        { name: 'assetClass', type: 'bytes4' },
        { name: 'data', type: 'bytes' }
      ]
    },
    domain: {
      name: 'NFT.com Marketplace',
      version: '1',
      chainId,
      verifyingContract: verifyingContract as `0x${string}`,
    },
    value: unsignedOrder
  };
};

export function unhashedMakeAsset(nft: PartialDeep<Nft>): UnhashedAsset {
  const makeAssetValue = BigNumber.from(1);
  const makeAssetMinimumBid = BigNumber.from(0);
  const makeAssetTokenId = BigNumber.from(nft.tokenId);
  return {
    class: NFT_TYPE_TO_ASSET_CLASS[nft.type],
    types: ['address', 'uint256', 'bool'],
    values: [
      ethers.utils.getAddress(nft.contract),
      makeAssetTokenId,
      false // allowAll
    ],
    data: [makeAssetValue, makeAssetMinimumBid]
  };
}

export function unhashedTakeAsset(
  saleCurrency: string,
  startingPrice: BigNumber,
  auctionType: AuctionType,
  takeAssetContractAddress: string,
  endingPrice?: BigNumber,
  reservePrice?: BigNumber,
  buyNowPrice?: BigNumber,
): UnhashedAsset {
  const takeAssetValue = auctionType === AuctionType.FixedPrice ?
    startingPrice :
    auctionType === AuctionType.Decreasing ?
      startingPrice :
      !isNullOrEmpty(buyNowPrice?.toString()) ?
        MAX_UINT_256 :
        buyNowPrice;

  const takeAssetMinimumBid = auctionType === AuctionType.FixedPrice ?
    startingPrice :
    auctionType === AuctionType.Decreasing ? endingPrice : reservePrice;
  return {
    class: saleCurrency === NULL_ADDRESS ? AssetClass.Eth : AssetClass.Erc20,
    types: ['address'],
    values: [takeAssetContractAddress],
    data: [
      takeAssetValue ?? BigNumber.from(0),
      takeAssetMinimumBid ?? BigNumber.from(0)
    ]
  };
}

export async function createNativeParametersForNFTListing(
  address: string,
  taker: string,
  duration: number,
  auctionType: AuctionType,
  nft: PartialDeep<Nft>,
  nonce: number,
  takeAssetContractAddress: string,
  startingPrice: BigNumber,
  endingPrice: BigNumber,
  buyNowPrice: BigNumber,
  reservePrice: BigNumber,
  currency: string,
  noExpirationNFTCOM: boolean,
): Promise<UnsignedOrder> {
  const salt = moment.utc().unix();
  const now = Date.now();
  // 1 minutes before for padding
  const start = noExpirationNFTCOM ? 0 : Math.floor((now / 1000) - (60 * 1));
  const end = noExpirationNFTCOM ? 0 : Math.floor((now + duration * 1000) / 1000);

  const unsignedOrder: UnsignedOrder = await getUnsignedOrder(
    ethers.utils.getAddress(address), // maker
    taker, //taker
    salt,
    start,
    end,
    nonce,
    auctionType,
    [unhashedMakeAsset(nft)], // makeAssets
    [unhashedTakeAsset(currency, startingPrice, auctionType, takeAssetContractAddress, endingPrice, reservePrice, buyNowPrice)], // takeAssets
  );

  return unsignedOrder;
}

export async function cancelNftcomListing(
  listing: PartialObjectDeep<TxActivity, unknown>,
  nftcomExchange: Marketplace
): Promise<boolean> {
  if (listing == null) {
    return;
  }

  const order = listing?.order?.protocolData as NftcomProtocolData;

  const cancelOrder = {
    maker: listing.order.makerAddress,
    makeAssets: [marketplaceAssetToAssetStruct(order.makeAsset[0])],
    taker: listing.order.takerAddress,
    takeAssets: [marketplaceAssetToAssetStruct(order.takeAsset[0])],
    salt: order.salt,
    start: order.start,
    end: order.end,
    nonce: listing?.order.nonce,
    auctionType: gqlAuctionTypeToOnchainAuctionType(order.auctionType)
  };

  return nftcomExchange.cancel(cancelOrder).then(tx => {
    return tx.wait(1).then(() => true).catch(() => false);
  }).catch(() => false);
}

export const nftcomBuyNow = async (
  order: StagedPurchase,
  nftcomExchange: Marketplace,
  executorAddress: string,
  chainId: string
): Promise<boolean> => {
  try {
    const {
      salt,
      makeAsset,
      takeAsset,
      start,
      end,
      auctionType,
      orderSignature: signature,
      buyNowTaker,
    } = order.protocolData as NftcomProtocolData & {
      orderSignature: Signature;
    };

    const nftcomOrder = {
      auctionType,
      buyNowTaker,
      chainId,
      end,
      id: order.activityId,
      makeAsset,
      makerAddress: order.makerAddress,
      nonce: order.nonce,
      salt,
      signature: {
        r: signature.r,
        s: signature.s,
        v: signature.v
      },
      start,
      structHash: order.orderHash,
      takeAsset,
      takerAddress: order?.takerAddress
    };
    const sellOrder = marketAskToOrderStruct(nftcomOrder);

    const tx = await nftcomExchange.buyNow(
      sellOrder,
      executorAddress,
      signature.v,
      signature.r,
      signature.s,
      {
        value: order?.price
      }
    );

    gtag('event', 'BuyNow', {
      ethereumAddress: executorAddress,
      protocol: order.protocol,
      contractAddress: order?.nft?.contract,
      tokenId: order?.nft?.tokenId,
      txHash: tx.hash,
      orderHash: order.orderHash,
    });

    fetch(`${getBaseUrl('https://www.nft.com/')}api/message?text=Buy Now on ${order.protocol} by ${executorAddress} for ${order.nft?.contract} ${order.nft?.tokenId}: https://etherscan.io/tx/${tx.hash}`);

    if (tx) {
      return await tx.wait(1).then(() => true).catch(() => false);
    } else {
      return false;
    }
  } catch (err) {
    console.log(`error in nftcomBuyNow: ${err}`);
    return false;
  }
};
