import { ListingTarget, StagedListing } from 'components/modules/Checkout/NFTListingsContext';
import { StagedPurchase } from 'components/modules/Checkout/NFTPurchaseContext';
import { NULL_ADDRESS } from 'constants/addresses';
import { AuctionType, LooksrareProtocolData, NftcomProtocolData, SeaportProtocolData, TxActivity, X2Y2ProtocolData } from 'graphql/generated/types';
import { PurchaseErrorResponse } from 'hooks/useNFTPurchaseError';
import { NFTSupportedCurrency } from 'hooks/useSupportedCurrencies';
import { ExternalProtocol } from 'types';
import { filterDuplicates, } from 'utils/format';

import { sameAddress } from './helpers';
import { multiplyBasisPoints } from './seaportHelpers';

import { BigNumber, BigNumberish, ethers } from 'ethers';
import { PartialDeep } from 'type-fest';

export const MAX_UINT_256 = BigNumber.from(2).pow(256).sub(1);
export type SaleDuration = '1 Hour' | '1 Day' | '7 Days' | '30 Days' | '60 Days' | '90 Days' | '180 Days' | '1 Year';

export const convertDurationToSec = (d: SaleDuration) => {
  const durationDays: {[s in SaleDuration]: number} = {
    '1 Hour': 1 / 24,
    '1 Day' : 1,
    '7 Days': 7,
    '30 Days': 30,
    '60 Days': 60,
    '90 Days': 3 * 30,
    '180 Days': 6 * 30,
    '1 Year': 7 * 4 * 12,
  };
  return 60 * 60 * 24 * durationDays[d];
};

export const convertDurationToSecForNumbersOnly = (d: number) => {
  return 60 * 60 * 24 * d;
};

export function needsERC20Approvals(stagedPurchases: StagedPurchase[]): boolean {
  if(stagedPurchases.length === 1) {
    return filterDuplicates(
      stagedPurchases?.filter(purchase => !sameAddress(NULL_ADDRESS, purchase?.currency)),
      (first, second) => first?.currency === second?.currency
    ).some(purchase => !purchase?.isERC20ApprovedForProtocol);
  }
  return filterDuplicates(
    stagedPurchases?.filter(purchase => !sameAddress(NULL_ADDRESS, purchase?.currency)),
    (first, second) => first?.currency === second?.currency
  ).some(purchase => !purchase?.isERC20ApprovedForAggregator);
}

export function hasSufficientBalances(
  stagedPurchases: StagedPurchase[],
  balances: Map<string, BigNumberish>,
): boolean {
  const uniqueCurrencyPurchases = filterDuplicates(
    stagedPurchases,
    (first, second) => first?.currency === second?.currency
  );
  const remainingBalances = new Map<string, BigNumber>();
  for (let i = 0; i < uniqueCurrencyPurchases.length; i++) {
    const balance = balances.get(uniqueCurrencyPurchases[i]?.currency);
    remainingBalances.set(uniqueCurrencyPurchases[i]?.currency ?? 'unsupported', BigNumber.from(balance ?? 0));
  }
  for (let i = 0; i < stagedPurchases.length; i++) {
    const remainingBalance = remainingBalances.get(stagedPurchases[i].currency);
    const price = BigNumber.from(stagedPurchases[i].price);
    if (remainingBalance.lt(price)) {
      return false;
    }
    remainingBalances.set(stagedPurchases[i].currency, remainingBalance.sub(price));
  }
  return true;
}

export function getTotalFormattedPriceUSD(
  stagedPurchases: StagedPurchase[],
  getByContractAddress: (contract: string) => NFTSupportedCurrency
): string {
  return stagedPurchases?.reduce((acc, curr) => {
    const currencyData = getByContractAddress(curr.currency);
    const formattedPrice = Number(ethers.utils.formatUnits(curr.price, currencyData?.decimals ?? 18));
    return acc + currencyData?.usd(formattedPrice);
  }, 0).toFixed(2);
}

export function getTotalMarketplaceFeesUSD(
  stagedPurchases: StagedPurchase[],
  looksrareProtocolFeeBps: BigNumberish,
  getByContractAddress: (contract: string) => NFTSupportedCurrency,
  hasGk: boolean
): number {
  return stagedPurchases?.reduce((cartTotal, stagedPurchase) => {
    if (stagedPurchase.protocol === ExternalProtocol.LooksRare) {
      const fee = BigNumber.from(
        looksrareProtocolFeeBps == null
          ? 0
          : multiplyBasisPoints(stagedPurchase?.price ?? 0, looksrareProtocolFeeBps)
      );
      const currencyData = getByContractAddress(stagedPurchase.currency);
      return cartTotal + currencyData?.usd(Number(ethers.utils.formatUnits(fee, currencyData?.decimals ?? 18)));
    } else if (hasGk || stagedPurchase.protocol === ExternalProtocol.NFTCOM) {
      return 0;
    } else {
      const fee = BigNumber.from(multiplyBasisPoints(stagedPurchase?.price ?? 0, 250));
      const currencyData = getByContractAddress(stagedPurchase.currency);
      return cartTotal + currencyData?.usd(Number(ethers.utils.formatUnits(fee, currencyData?.decimals ?? 18)));
    }
  }, 0);
}

export function getTotalRoyaltiesUSD(
  stagedPurchases: StagedPurchase[],
  looksrareProtocolFeeBps: BigNumberish,
  getByContractAddress: (contract: string) => NFTSupportedCurrency,
  nftComRoyaltyFees: number[]
): number {
  return stagedPurchases?.reduce((cartTotal, stagedPurchase, index) => {
    if (stagedPurchase.protocol === ExternalProtocol.LooksRare) {
      const protocolData = stagedPurchase?.protocolData as LooksrareProtocolData;
      const minAskAmount = BigNumber.from(protocolData?.minPercentageToAsk ?? 0)
        .mul(BigNumber.from(protocolData?.price ?? 0))
        .div(10000);
      const marketplaceFeeAmount = BigNumber.from(looksrareProtocolFeeBps ?? 0)
        .mul(BigNumber.from(protocolData?.price ?? 0))
        .div(10000);
      const royalty = minAskAmount.sub(marketplaceFeeAmount);
      const currencyData = getByContractAddress(stagedPurchase.currency);
      return cartTotal + currencyData?.usd(Number(ethers.utils.formatUnits(royalty, currencyData?.decimals ?? 18)));
    } else if (stagedPurchase.protocol === ExternalProtocol.Seaport) {
      const protocolData = stagedPurchase?.protocolData as SeaportProtocolData;
      const royalty = BigNumber.from(protocolData?.parameters?.consideration.length === 3 ?
        protocolData?.parameters?.consideration[2].startAmount :
        0);
      const currencyData = getByContractAddress(stagedPurchase.currency);
      return cartTotal + currencyData?.usd(Number(ethers.utils.formatUnits(royalty, currencyData?.decimals ?? 18)));
    } else if (stagedPurchase.protocol === ExternalProtocol.X2Y2) {
      const protocolData = stagedPurchase?.protocolData as X2Y2ProtocolData;
      const royalty = BigNumber.from(protocolData?.royalty_fee);
      const currencyData = getByContractAddress(stagedPurchase.currency);
      return cartTotal + currencyData?.usd(Number(ethers.utils.formatUnits(royalty, currencyData?.decimals ?? 18)));
    } else if (stagedPurchase.protocol === ExternalProtocol.NFTCOM) {
      const NFTCOMRoyaltyFee = nftComRoyaltyFees?.[index];

      const royalty = Number(NFTCOMRoyaltyFee ?? 0);
      const currencyData = getByContractAddress(stagedPurchase.currency);
      return cartTotal + currencyData?.usd(Number(ethers.utils.formatUnits(
        royalty,
        3, // royalties from NFT.com have decimals 3
      ))) ?? 0;
    }
  }, 0);
}

export function getMaxMarketplaceFeesUSD(
  stagedListings: StagedListing[],
  looksrareProtocolFeeBps: BigNumberish,
  getByContractAddress: (contract: string) => NFTSupportedCurrency,
  NFTCOMFee: number,
  hasGk: boolean
): number {
  return stagedListings?.reduce((cartTotal, stagedListing) => {
    const feesByMarketplace = stagedListing?.targets.map((target: ListingTarget) => {
      const currencyData = getByContractAddress(stagedListing.currency ?? target.currency);
      if (target.protocol === ExternalProtocol.LooksRare) {
        // Looksrare fee is fetched from the smart contract.
        const fee = BigNumber.from(looksrareProtocolFeeBps == null
          ? 0
          : multiplyBasisPoints((stagedListing.startingPrice ?? target?.startingPrice) ?? 0, looksrareProtocolFeeBps));
        return currencyData?.usd(Number(ethers.utils.formatUnits(
          fee,
          currencyData.decimals ?? 18
        ))) ?? 0;
      } else if (target.protocol === ExternalProtocol.NFTCOM) {
        if(hasGk) {
          return 0;
        } else {
          const fee = BigNumber.from(multiplyBasisPoints((stagedListing.startingPrice ?? target?.startingPrice) ?? 0, NFTCOMFee));
          return currencyData?.usd(Number(ethers.utils.formatUnits(
            fee,
            currencyData.decimals ?? 18
          ))) ?? 0;
        }
      } else {
        // Seaport fee is hard-coded in our codebase and not expected to change.
        const fee = BigNumber.from(multiplyBasisPoints((stagedListing.startingPrice ?? target?.startingPrice) ?? 0, 250));
        return currencyData?.usd(Number(ethers.utils.formatUnits(
          fee,
          currencyData.decimals ?? 18
        ))) ?? 0;
      }
    });
    return cartTotal + Math.max(...feesByMarketplace || []);
  }, 0);
}

export function getMaxRoyaltyFeesUSD(
  stagedListings: StagedListing[],
  looksrareProtocolFeeBps: BigNumberish,
  getByContractAddress: (contract: string) => NFTSupportedCurrency,
  toListNftComRoyaltyFees: number[],
  x2y2Fees: number[]
): number {
  return stagedListings?.reduce((cartTotal, stagedListing) => {
    const royaltiesByMarketplace = stagedListing?.targets.map((target: ListingTarget, index: number) => {
      const currencyData = getByContractAddress(stagedListing.currency ?? target.currency);
      if (target.protocol === ExternalProtocol.LooksRare) {
        const minAskAmount = BigNumber.from(target?.looksrareOrder?.minPercentageToAsk ?? 0)
          .div(10000)
          .mul(BigNumber.from(target?.looksrareOrder?.price ?? 0));
        const marketplaceFeeAmount = BigNumber.from(looksrareProtocolFeeBps ?? 0)
          .div(10000)
          .mul(BigNumber.from(target?.looksrareOrder?.price ?? 0));
        const royalty = minAskAmount.sub(marketplaceFeeAmount);
        return currencyData?.usd(Number(ethers.utils.formatUnits(
          royalty,
          currencyData.decimals ?? 18
        ))) ?? 0;
      } else if (target.protocol === ExternalProtocol.Seaport) {
        const royalty = BigNumber.from(target?.seaportParameters?.consideration.length === 3 ?
          target?.seaportParameters?.consideration[2].startAmount :
          0);
        return currencyData?.usd(Number(ethers.utils.formatUnits(
          royalty,
          currencyData.decimals ?? 18
        ))) ?? 0;
      } else if (target.protocol === ExternalProtocol.NFTCOM) {
        const NFTCOMRoyaltyFee = toListNftComRoyaltyFees?.[index];
        const royalty = NFTCOMRoyaltyFee ?? 0;
        return currencyData?.usd(Number(ethers.utils.formatUnits(
          royalty,
          3, // royalties from NFT.com have decimals 3
        ))) ?? 0;
      } else if (target.protocol === ExternalProtocol.X2Y2) {
        const royalty = x2y2Fees?.[index] ?? 0;
        return currencyData?.usd(Number(ethers.utils.formatUnits(
          royalty,
          currencyData.decimals ?? 18
        ))) ?? 0;
      } else {
        // TODO: handle
      }
    });
    return cartTotal + Math.max(...royaltiesByMarketplace || []);
  }, 0);
}

export function filterValidListings(listings: PartialDeep<TxActivity>[]): PartialDeep<TxActivity>[] {
  return listings?.filter(listing => {
    const seaportValid = (listing.order?.protocolData as SeaportProtocolData)?.parameters &&
      (listing.order?.protocolData as SeaportProtocolData)?.parameters?.consideration?.length;
    const looksrareValid = (listing.order?.protocolData as LooksrareProtocolData)?.price != null;
    const X2Y2Valid = (listing.order?.protocolData as X2Y2ProtocolData)?.price != null;
    const NFTCOMValid = (listing.order?.protocolData as NftcomProtocolData)?.takeAsset &&
    (listing.order?.protocolData as NftcomProtocolData)?.takeAsset[0]?.value != null;
    return listing.order?.protocolData != null && (looksrareValid || seaportValid || X2Y2Valid || NFTCOMValid);
  }) ?? [];
}

export function getProtocolDisplayName(protocolName: ExternalProtocol): string {
  if(protocolName === ExternalProtocol.NFTCOM){
    return 'NFT.com';
  }
  if(protocolName === ExternalProtocol.Seaport){
    return 'Opensea';
  }
  return protocolName;
}

export function getAuctionTypeDisplayName(auctionType: AuctionType): string {
  switch(auctionType) {
  case AuctionType.FixedPrice:
    return 'Fixed Price';
  case AuctionType.Decreasing:
    return 'Decreasing Price';
  case AuctionType.English:
    return 'English Auction';
  }
}

export function getErrorText(error: PurchaseErrorResponse['error']): string {
  switch(error) {
  case 'PurchaseBalanceError':
    return 'The purchase failed because your token balance is too low.';
  case 'ConnectionError':
    return 'Your wallet is not connected. Please connect your wallet and try again.';
  case 'ApprovalError':
    return 'The approval was not accepted in your wallet. If you would like to continue your purchase, please try again.';
  case 'ListingExpiredError':
    return 'The transaction failed due to an expired listing. Please verify that your cart is valid and try again.';
  case 'PurchaseUnknownError':
    return 'The transaction failed for an unknown reason. Please verify that your cart is valid and try again.';
  }
}
