import { StagedPurchase } from 'components/modules/Checkout/NFTPurchaseContext';
import { useLooksrareExchangeContract } from 'hooks/contracts/useLooksrareExchangeContract';
import { useNftcomExchangeContract } from 'hooks/contracts/useNftcomExchangeContract';
import { useSeaportContract } from 'hooks/contracts/useSeaportContract';
import { useX2Y2ExchangeContract } from 'hooks/contracts/useX2Y2ExchangeContract';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { ExternalProtocol } from 'types';
import { nftcomBuyNow } from 'utils/nativeMarketplaceHelpers';

import { isNullOrEmpty } from './format';
import { getBaseUrl } from './isEnv';
import { looksrareBuyNow } from './looksrareHelpers';
import { seaportBuyNow } from './seaportHelpers';
import { X2Y2BuyNow } from './X2Y2Helpers';

import { BigNumber, BigNumberish, ethers, Signer } from 'ethers';
import { useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';

export async function getOpenseaCollection(
  contract: string,
): Promise<any> {
  const url = new URL(getBaseUrl() + 'api/opensea');
  url.searchParams.set('contract', contract);
  url.searchParams.set('action', 'getCollection');

  const result = await fetch(url.toString()).then(res => res.json());
  return result;
}

export async function getLooksrareNonce(address: string): Promise<number> {
  const url = new URL(getBaseUrl() + 'api/looksrare');
  url.searchParams.set('action', 'getNonce');
  url.searchParams.set('address', address);
  const result = await fetch(url.toString()).then(res => res.json());
  return BigNumber.from(result?.['data'] ?? 0).toNumber();
}

export async function getSeaportOrders(contract: string, tokenId: BigNumberish): Promise<any[]> {
  if (tokenId == null || isNullOrEmpty(contract)) {
    return [];
  }
  const url = new URL(getBaseUrl() + 'api/seaport');
  url.searchParams.set('action', 'getOrders');
  url.searchParams.set('contract', contract);
  url.searchParams.set('tokenId', BigNumber.from(tokenId).toString());
  const result = await fetch(url.toString()).then(res => res.json());
  return result?.orders?.filter(order => !order?.['cancelled'] && !order?.['finalized']) ?? [];
}

export async function getLooksrareOrders(contract: string, tokenId: BigNumberish): Promise<any> {
  if (tokenId == null || isNullOrEmpty(contract)) {
    return [];
  }
  const url = new URL(getBaseUrl() + 'api/looksrare');
  url.searchParams.set('action', 'getOrders');
  url.searchParams.set('contract', contract);
  url.searchParams.set('tokenId', BigNumber.from(tokenId).toString());
  const result = await fetch(url.toString()).then(res => res.json());
  return result?.data ?? [];
}

export const seaportLib = new ethers.utils.Interface(
  '[{"inputs":[],"name":"InputLengthMiconstsmatch","type":"error"},{"inputs":[],"name":"OPENSEA","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"components":[{"components":[{"internalType":"address","name":"offerer","type":"address"},{"internalType":"address","name":"zone","type":"address"},{"components":[{"internalType":"enum ItemType","name":"itemType","type":"uint8"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"identifierOrCriteria","type":"uint256"},{"internalType":"uint256","name":"startAmount","type":"uint256"},{"internalType":"uint256","name":"endAmount","type":"uint256"}],"internalType":"struct OfferItem[]","name":"offer","type":"tuple[]"},{"components":[{"internalType":"enum ItemType","name":"itemType","type":"uint8"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"identifierOrCriteria","type":"uint256"},{"internalType":"uint256","name":"startAmount","type":"uint256"},{"internalType":"uint256","name":"endAmount","type":"uint256"},{"internalType":"address payable","name":"recipient","type":"address"}],"internalType":"struct ConsiderationItem[]","name":"consideration","type":"tuple[]"},{"internalType":"enum OrderType","name":"orderType","type":"uint8"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"bytes32","name":"zoneHash","type":"bytes32"},{"internalType":"uint256","name":"salt","type":"uint256"},{"internalType":"bytes32","name":"conduitKey","type":"bytes32"},{"internalType":"uint256","name":"totalOriginalConsiderationItems","type":"uint256"}],"internalType":"struct OrderParameters","name":"parameters","type":"tuple"},{"internalType":"uint120","name":"numerator","type":"uint120"},{"internalType":"uint120","name":"denominator","type":"uint120"},{"internalType":"bytes","name":"signature","type":"bytes"},{"internalType":"bytes","name":"extraData","type":"bytes"}],"internalType":"struct AdvancedOrder[]","name":"advancedOrders","type":"tuple[]"},{"components":[{"internalType":"uint256","name":"orderIndex","type":"uint256"},{"internalType":"enum Side","name":"side","type":"uint8"},{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"uint256","name":"identifier","type":"uint256"},{"internalType":"bytes32[]","name":"criteriaProof","type":"bytes32[]"}],"internalType":"struct CriteriaResolver[]","name":"criteriaResolvers","type":"tuple[]"},{"components":[{"internalType":"uint256","name":"orderIndex","type":"uint256"},{"internalType":"uint256","name":"itemIndex","type":"uint256"}],"internalType":"struct FulfillmentComponent[][]","name":"offerFulfillments","type":"tuple[][]"},{"components":[{"internalType":"uint256","name":"orderIndex","type":"uint256"},{"internalType":"uint256","name":"itemIndex","type":"uint256"}],"internalType":"struct FulfillmentComponent[][]","name":"considerationFulfillments","type":"tuple[][]"},{"internalType":"bytes32","name":"fulfillerConduitKey","type":"bytes32"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"maximumFulfilled","type":"uint256"}],"internalType":"struct SeaportLib1_1.SeaportBuyOrder[]","name":"openSeaBuys","type":"tuple[]"},{"internalType":"uint256[]","name":"msgValue","type":"uint256[]"},{"internalType":"bool","name":"revertIfTrxFails","type":"bool"}],"name":"fulfillAvailableAdvancedOrders","outputs":[],"stateMutability":"nonpayable","type":"function"}]',
);
export const looksrareLib = new ethers.utils.Interface(
  '[{"inputs":[],"name":"InvalidChain","type":"error"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"tradeData","type":"bytes"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bool","name":"revertTxFail","type":"bool"}],"name":"_tradeHelper","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]',
);

export const X2Y2Lib = new ethers.utils.Interface(
  '[{"inputs":[],"name":"InvalidChain","type":"error"},{"inputs":[{"components":[{"components":[{"internalType":"uint256","name":"salt","type":"uint256"},{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"network","type":"uint256"},{"internalType":"uint256","name":"intent","type":"uint256"},{"internalType":"uint256","name":"delegateType","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"contract IERC20Upgradeable","name":"currency","type":"address"},{"internalType":"bytes","name":"dataMask","type":"bytes"},{"components":[{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct OrderItem[]","name":"items","type":"tuple[]"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"uint8","name":"signVersion","type":"uint8"}],"internalType":"struct Order[]","name":"orders","type":"tuple[]"},{"components":[{"internalType":"enum Op","name":"op","type":"uint8"},{"internalType":"uint256","name":"orderIdx","type":"uint256"},{"internalType":"uint256","name":"itemIdx","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"bytes32","name":"itemHash","type":"bytes32"},{"internalType":"contract IDelegate","name":"executionDelegate","type":"address"},{"internalType":"bytes","name":"dataReplacement","type":"bytes"},{"internalType":"uint256","name":"bidIncentivePct","type":"uint256"},{"internalType":"uint256","name":"aucMinIncrementPct","type":"uint256"},{"internalType":"uint256","name":"aucIncDurationSecs","type":"uint256"},{"components":[{"internalType":"uint256","name":"percentage","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"internalType":"struct Fee[]","name":"fees","type":"tuple[]"}],"internalType":"struct SettleDetail[]","name":"details","type":"tuple[]"},{"components":[{"internalType":"uint256","name":"salt","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountToEth","type":"uint256"},{"internalType":"uint256","name":"amountToWeth","type":"uint256"},{"internalType":"address","name":"user","type":"address"},{"internalType":"bool","name":"canFail","type":"bool"}],"internalType":"struct SettleShared","name":"shared","type":"tuple"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"internalType":"struct RunInput","name":"_input","type":"tuple"},{"internalType":"uint256","name":"_msgValue","type":"uint256"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bool","name":"_revertIfTrxFails","type":"bool"}],"name":"_run","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
);

export const NFTCOMLib = new ethers.utils.Interface(
  '[ { "inputs": [], "name": "InvalidChain", "type": "error" }, { "inputs": [ { "components": [ { "components": [ { "internalType": "address", "name": "maker", "type": "address" }, { "components": [ { "components": [ { "internalType": "bytes4", "name": "assetClass", "type": "bytes4" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct LibAsset.AssetType", "name": "assetType", "type": "tuple" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct LibAsset.Asset[]", "name": "makeAssets", "type": "tuple[]" }, { "internalType": "address", "name": "taker", "type": "address" }, { "components": [ { "components": [ { "internalType": "bytes4", "name": "assetClass", "type": "bytes4" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct LibAsset.AssetType", "name": "assetType", "type": "tuple" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct LibAsset.Asset[]", "name": "takeAssets", "type": "tuple[]" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "uint256", "name": "start", "type": "uint256" }, { "internalType": "uint256", "name": "end", "type": "uint256" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "enum LibSignature.AuctionType", "name": "auctionType", "type": "uint8" } ], "internalType": "struct LibSignature.Order", "name": "sellOrder", "type": "tuple" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "internalType": "struct BuyNowParams", "name": "params", "type": "tuple" }, { "internalType": "uint256", "name": "_msgValue", "type": "uint256" }, { "internalType": "bool", "name": "_revertIfTrxFails", "type": "bool" } ], "name": "_buySwap", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "components": [ { "internalType": "address", "name": "maker", "type": "address" }, { "components": [ { "components": [ { "internalType": "bytes4", "name": "assetClass", "type": "bytes4" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct LibAsset.AssetType", "name": "assetType", "type": "tuple" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct LibAsset.Asset[]", "name": "makeAssets", "type": "tuple[]" }, { "internalType": "address", "name": "taker", "type": "address" }, { "components": [ { "components": [ { "internalType": "bytes4", "name": "assetClass", "type": "bytes4" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct LibAsset.AssetType", "name": "assetType", "type": "tuple" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct LibAsset.Asset[]", "name": "takeAssets", "type": "tuple[]" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "uint256", "name": "start", "type": "uint256" }, { "internalType": "uint256", "name": "end", "type": "uint256" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "enum LibSignature.AuctionType", "name": "auctionType", "type": "uint8" } ], "internalType": "struct LibSignature.Order", "name": "sellOrder", "type": "tuple" }, { "components": [ { "internalType": "address", "name": "maker", "type": "address" }, { "components": [ { "components": [ { "internalType": "bytes4", "name": "assetClass", "type": "bytes4" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct LibAsset.AssetType", "name": "assetType", "type": "tuple" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct LibAsset.Asset[]", "name": "makeAssets", "type": "tuple[]" }, { "internalType": "address", "name": "taker", "type": "address" }, { "components": [ { "components": [ { "internalType": "bytes4", "name": "assetClass", "type": "bytes4" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct LibAsset.AssetType", "name": "assetType", "type": "tuple" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct LibAsset.Asset[]", "name": "takeAssets", "type": "tuple[]" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }, { "internalType": "uint256", "name": "start", "type": "uint256" }, { "internalType": "uint256", "name": "end", "type": "uint256" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "enum LibSignature.AuctionType", "name": "auctionType", "type": "uint8" } ], "internalType": "struct LibSignature.Order", "name": "buyOrder", "type": "tuple" }, { "internalType": "uint8[2]", "name": "v", "type": "uint8[2]" }, { "internalType": "bytes32[2]", "name": "r", "type": "bytes32[2]" }, { "internalType": "bytes32[2]", "name": "s", "type": "bytes32[2]" } ], "internalType": "struct ExecuteSwapParams", "name": "params", "type": "tuple" }, { "internalType": "uint256", "name": "_msgValue", "type": "uint256" }, { "internalType": "bool", "name": "_revertIfTrxFails", "type": "bool" } ], "name": "_executeSwap", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]'
);

export const libraryCall = (fnSig: string, entireHex: string): string => {
  if(isNullOrEmpty(fnSig) || isNullOrEmpty(entireHex)){
    return;
  }
  return (
    `${(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fnSig)) as unknown as Buffer)
      .toString('hex')
      .substring(0, 10)}` + entireHex
  );
};

export type BuyNowInterface = {
  buyNow: (executorAddress: string, order: StagedPurchase) => Promise<boolean>
};

export function useBuyNow(signer: Signer): BuyNowInterface {
  const { address: currentAddress } = useAccount();
  const looksrareExchange = useLooksrareExchangeContract(signer);
  const NftcomExchange = useNftcomExchangeContract(signer);
  const X2Y2Exchange = useX2Y2ExchangeContract(signer);
  const seaportExchange = useSeaportContract(signer);
  const defaultChainId = useDefaultChainId();
  const { data: ethBalance } = useBalance({ address: currentAddress, watch: true });

  const buyNow = useCallback(async (
    executorAddress: string,
    order: StagedPurchase,
  ) => {
    try {
      switch(order.protocol){
      case ExternalProtocol.LooksRare:
        return await looksrareBuyNow(order, looksrareExchange, executorAddress, ethBalance);
      case ExternalProtocol.NFTCOM:
        return await nftcomBuyNow(order, NftcomExchange, executorAddress, defaultChainId);
      case ExternalProtocol.X2Y2:
        return await X2Y2BuyNow(order, X2Y2Exchange, executorAddress);
      case ExternalProtocol.Seaport:
        return await seaportBuyNow(order, seaportExchange, executorAddress);
      default:
        break;
      }
    } catch (err) {
      console.log(`error in buyNow: ${err}`);
      return false;
    }
  }, [NftcomExchange, X2Y2Exchange, defaultChainId, ethBalance, looksrareExchange, seaportExchange]);

  return {
    buyNow
  };
}
