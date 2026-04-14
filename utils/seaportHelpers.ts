import { StagedPurchase } from 'components/modules/Checkout/NFTPurchaseContext';
import { NULL_ADDRESS } from 'constants/addresses';
import { Seaport } from 'constants/typechain';
import { OrderComponentsStruct } from 'constants/typechain/Seaport';
import { Maybe, Nft, NftType, SeaportConsideration, SeaportProtocolData, SeaportProtocolDataParams } from 'graphql/generated/types';
import { AggregatorResponse } from 'types';
import {
  CROSS_CHAIN_SEAPORT_ADDRESS,
  EIP_712_ORDER_TYPE,
  Fee,
  ItemType,
  ONE_HUNDRED_PERCENT_BP,
  OPENSEA_CONDUIT_KEY, OrderType, SEAPORT_CONTRACT_NAME,
  SEAPORT_CONTRACT_VERSION,
  SEAPORT_FEE_COLLLECTION_ADDRESS,
  SEAPORT_ZONE_HASH,
  SeaportConsiderationItem,
  SeaportOrderComponents,
  SeaportOrderParameters
} from 'types/seaport';

import { filterNulls } from './format';
import { getBaseUrl } from './isEnv';
import { libraryCall, seaportLib } from './marketplaceHelpers';

import { BigNumber, BigNumberish, ethers } from 'ethers';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import { PartialDeep } from 'type-fest';

export function getTypedDataDomain(chainId: string | number) {
  return {
    name: SEAPORT_CONTRACT_NAME,
    version: SEAPORT_CONTRACT_VERSION,
    chainId,
    verifyingContract: CROSS_CHAIN_SEAPORT_ADDRESS as `0x${string}`,
  };
}

export function getMessageToSign(
  orderParameters: SeaportOrderComponents,
  chainId: string | number
) {
  return JSON.stringify(_TypedDataEncoder.getPayload(
    getTypedDataDomain(chainId),
    EIP_712_ORDER_TYPE,
    orderParameters,
  ));
}

export const generateRandomSalt: () => string = () => {
  return `0x${Buffer.from(ethers.utils.randomBytes(16)).toString('hex')}`;
};

export const multiplyBasisPoints = (amount: BigNumberish, basisPoints: BigNumberish) =>
  BigNumber.from(amount || 0)
    .mul(BigNumber.from(basisPoints || 0))
    .div(ONE_HUNDRED_PERCENT_BP);

export const isCurrencyItem = ({ itemType }: SeaportConsiderationItem) =>
  [ItemType.NATIVE, ItemType.ERC20].includes(itemType);

export function deductFees(considerationItems: SeaportConsiderationItem[], fees: Fee[]) {
  const totalBasisPoints = fees.reduce(
    (accBasisPoints, fee) => accBasisPoints + fee.basisPoints,
    0
  );
  return considerationItems.map((item) => ({
    ...item,
    startAmount: isCurrencyItem(item)
      ? BigNumber.from(item.startAmount)
        .sub(multiplyBasisPoints(item.startAmount, totalBasisPoints))
        .toString()
      : item.startAmount,
    endAmount: isCurrencyItem(item)
      ? BigNumber.from(item.endAmount)
        .sub(multiplyBasisPoints(item.endAmount, totalBasisPoints))
        .toString()
      : item.endAmount,
  }));
}

export const feeToConsiderationItem = ({
  fee,
  token,
  baseAmount,
  baseEndAmount = baseAmount,
}: {
  fee: Fee;
  token: string;
  baseAmount: BigNumberish;
  baseEndAmount?: BigNumberish;
}): SeaportConsiderationItem => {
  return {
    itemType:
      token === ethers.constants.AddressZero ? ItemType.NATIVE : ItemType.ERC20,
    token,
    identifierOrCriteria: '0',
    startAmount: multiplyBasisPoints(baseAmount, fee.basisPoints).toString(),
    endAmount: multiplyBasisPoints(baseEndAmount, fee.basisPoints).toString(),
    recipient: fee.recipient,
  };
};

export function createSeaportParametersForNFTListing(
  offerer: string,
  nft: PartialDeep<Nft>,
  startingPrice: BigNumberish,
  endingPrice: BigNumberish,
  currency: string,
  duration: BigNumberish,
  collectionFee: Maybe<Fee>,
): SeaportOrderParameters {
  // This is what the seller will accept for their NFT.
  // For now, we support a single currency.
  const considerationItems = [{
    itemType: currency === NULL_ADDRESS ? ItemType.NATIVE : ItemType.ERC20,
    token: currency,
    identifierOrCriteria: BigNumber.from(0).toString(),
    startAmount: BigNumber.from(startingPrice).toString(),
    endAmount: BigNumber.from(endingPrice ?? startingPrice).toString(),
    recipient: offerer,
  }];
  const openseaFee: Fee = {
    recipient: SEAPORT_FEE_COLLLECTION_ADDRESS,
    basisPoints: 250,
  };

  const considerationItemsWithFees = filterNulls([
    ...deductFees(considerationItems, filterNulls([openseaFee, collectionFee])),
    feeToConsiderationItem({
      fee: openseaFee,
      token: currency,
      baseAmount: startingPrice,
      baseEndAmount: endingPrice ?? startingPrice
    }),
    collectionFee != null
      ? feeToConsiderationItem({
        fee: collectionFee,
        token: currency,
        baseAmount: startingPrice,
        baseEndAmount: endingPrice ?? startingPrice
      })
      : null
  ]);

  return {
    offerer: offerer ?? NULL_ADDRESS,
    zone: NULL_ADDRESS,
    offer: [{
      itemType: nft?.type == NftType.Erc721 ? ItemType.ERC721 : ItemType.ERC1155,
      token: nft?.contract,
      identifierOrCriteria: BigNumber.from(nft?.tokenId).toString(),
      startAmount: BigNumber.from(1).toString(),
      endAmount: BigNumber.from(1).toString(),
    }],
    consideration: considerationItemsWithFees,
    orderType: OrderType.FULL_OPEN,
    startTime: BigNumber.from(Date.now()).div(1000).toString(),
    endTime: BigNumber.from(Date.now()).div(1000).add(duration).toString(),
    zoneHash: SEAPORT_ZONE_HASH,
    totalOriginalConsiderationItems: String(considerationItemsWithFees.length),
    salt: generateRandomSalt(),
    conduitKey: OPENSEA_CONDUIT_KEY,
  };
}

export async function cancelSeaportListing(
  order: SeaportProtocolDataParams,
  seaportExchange: Seaport
) {
  return await seaportExchange.cancel([order as OrderComponentsStruct])
    .then((tx) => {
      return tx.wait(1).then(() => true).catch(() => false);
    })
    .catch(() => false);
}

export const generateOfferArray = (array: any) => {
  return array.map((item: any, index: string) => [
    {
      orderIndex: index,
      itemIndex: item.length - 1,
    },
  ]);
};

interface ConsiderationObjMap {
  [key: string]: Array<ConsiderationFulfillmentUnit>;
}

interface ConsiderationFulfillmentUnit {
  orderIndex: string;
  itemIndex: string;
}

export const generateOrderConsiderationArray = (
  considerations: Array<Array<SeaportConsideration>>,
): Array<Array<ConsiderationFulfillmentUnit>> | undefined => {
  const mapIndex: ConsiderationObjMap = {};
  considerations.map((item: Array<SeaportConsideration>, index: number) =>
    item.map((i: SeaportConsideration, shortIndex: number) => {
      if (mapIndex[i.recipient + i.token] == undefined) {
        mapIndex[i.recipient + i.token] = [{ orderIndex: index.toString(), itemIndex: shortIndex.toString() }];
      } else {
        mapIndex[i.recipient + i.token].push({ orderIndex: index.toString(), itemIndex: shortIndex.toString() });
      }
    }),
  );

  return Object.values(mapIndex);
};

export const getSeaportHex = (
  recipient: string,
  orders: SeaportProtocolData[],
  ethValues: BigNumber[],
): AggregatorResponse => {
  try {
    const orderParams = [];

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      orderParams.push({
        denominator: '1',
        numerator: '1',
        parameters: {
          conduitKey: order?.parameters?.conduitKey,
          consideration: order?.parameters?.consideration,
          endTime: order?.parameters?.endTime,
          offer: order?.parameters?.offer,
          offerer: order?.parameters?.offerer, // seller
          orderType: order?.parameters?.orderType,
          salt: order?.parameters?.salt,
          startTime: order?.parameters?.startTime,
          totalOriginalConsiderationItems: order?.parameters?.totalOriginalConsiderationItems,
          zone: order?.parameters?.zone, // opensea pausable zone
          zoneHash: order?.parameters?.zoneHash,
        },
        signature: order?.signature,
        extraData: '0x',
      });
    }

    const orderStruct = [
      [
        orderParams, // advancedOrders
        [], // criteria resolvers
        generateOfferArray(orderParams.map(i => i.parameters.offer)), // array of all offers (offers fulfillment)
        generateOrderConsiderationArray(orderParams.map(i => i.parameters.consideration)), // array of all considerations (considerations fulfillment)
        '0x0000000000000000000000000000000000000000000000000000000000000000', // fulfillerConduitKey
        recipient, // recipient
        orders.length.toString(), // maximumFulfilled
      ],
    ];

    const msgValue: ethers.BigNumber = ethValues
      .reduce(
        (partialSum: ethers.BigNumber, a: ethers.BigNumber) => ethers.BigNumber.from(partialSum).add(a),
        ethers.BigNumber.from(0),
      );

    // input data for SeaportLibV1_1
    const inputData = [orderStruct, [msgValue], true];
    const wholeHex = seaportLib.encodeFunctionData('fulfillAvailableAdvancedOrders', inputData);
    const genHex = libraryCall(
      'fulfillAvailableAdvancedOrders(SeaportLib1_1.SeaportBuyOrder[],uint256[],bool)',
      wholeHex.slice(10),
    );

    return {
      tradeData: genHex,
      value: msgValue,
      marketId: '1',
    };
  } catch (err) {
    throw `error in getSeaportHex: ${err}`;
  }
};

export function getOpenseaAssetPageUrl(contractAddress: string, tokenId: string) {
  return `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;
}

export const seaportBuyNow = async (
  order: StagedPurchase,
  seaportExchange: Seaport,
  executorAddress: string
): Promise<boolean> => {
  try {
    const orderParams = [];
    const seaportOrder = order.protocolData as SeaportProtocolData;
    orderParams.push({
      denominator: '1',
      numerator: '1',
      parameters: {
        conduitKey: seaportOrder?.parameters?.conduitKey,
        consideration: seaportOrder?.parameters?.consideration,
        endTime: seaportOrder?.parameters?.endTime,
        offer: seaportOrder?.parameters?.offer,
        offerer: seaportOrder?.parameters?.offerer, // seller
        orderType: seaportOrder?.parameters?.orderType,
        salt: seaportOrder?.parameters?.salt,
        startTime: seaportOrder?.parameters?.startTime,
        totalOriginalConsiderationItems: seaportOrder?.parameters?.totalOriginalConsiderationItems,
        zone: seaportOrder?.parameters?.zone, // opensea pausable zone
        zoneHash: seaportOrder?.parameters?.zoneHash,
      },
      signature: seaportOrder?.signature,
      extraData: '0x',
    });

    const tx = await seaportExchange.fulfillAvailableAdvancedOrders(
      orderParams, // advancedOrders
      [], // criteria resolvers
      generateOfferArray(orderParams.map(i => i.parameters.offer)), // array of all offers (offers fulfillment)
      generateOrderConsiderationArray(orderParams.map(i => i.parameters.consideration)), // array of all considerations (considerations fulfillment)
      '0x0000000000000000000000000000000000000000000000000000000000000000', // fulfillerConduitKey
      executorAddress, // recipient
      1, // maximumFulfilled)
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
    console.log(`error in seaportBuyNow: ${err}`);
    return false;
  }
};
