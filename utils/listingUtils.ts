import { NULL_ADDRESS } from 'constants/addresses';
import { AuctionType, LooksrareProtocolData, NftcomProtocolData, SeaportProtocolData, TxActivity, X2Y2ProtocolData } from 'graphql/generated/types';
import { ExternalProtocol } from 'types';
import { isNullOrEmpty } from 'utils/format';

import { sameAddress } from './helpers';
import { getAddress } from './httpHooks';

import { BigNumber, ethers } from 'ethers';
import moment, { Moment } from 'moment';
import { PartialDeep } from 'type-fest';
import { PartialObjectDeep } from 'type-fest/source/partial-deep';

export const getListingPrice = (listing: PartialDeep<TxActivity>, currentTimestamp?: Moment) => {
  switch(listing?.order?.protocol) {
  case (ExternalProtocol.LooksRare): {
    const order = listing?.order?.protocolData as LooksrareProtocolData;
    return BigNumber.from(order?.price ?? 0);
  }
  case (ExternalProtocol.Seaport): {
    const order = listing?.order?.protocolData as SeaportProtocolData;
    return order?.parameters?.consideration
      ?.reduce((total, consideration) => total.add(BigNumber.from(consideration?.startAmount ?? 0)), BigNumber.from(0));
  }
  case (ExternalProtocol.X2Y2): {
    const order = listing?.order?.protocolData as X2Y2ProtocolData;
    return BigNumber.from(order?.price ?? 0);
  }
  case (ExternalProtocol.NFTCOM): {
    const order = listing?.order?.protocolData as NftcomProtocolData;

    if (order.auctionType === AuctionType.Decreasing) {
      const startPrice = BigNumber.from(order.takeAsset[0].value);
      const endPrice = BigNumber.from(order.takeAsset[0].minimumBid);
      const b = moment.unix(order?.start);
      const secondsPassed = currentTimestamp ? BigNumber.from(currentTimestamp.diff(b, 'seconds')) : BigNumber.from(0);

      const publicSaleDurationSeconds = BigNumber.from(order?.end).sub(BigNumber.from(order?.start));
      const totalPriceChange = startPrice.sub(endPrice);
      const currentPriceChange = totalPriceChange.mul(secondsPassed).div(publicSaleDurationSeconds);
      const stringPrice = startPrice.sub(currentPriceChange);

      return stringPrice;
    }
    return BigNumber.from(order?.takeAsset[0]?.value ?? 0);
  }
  }
};

export const getListingPriceUSD: (
  listing: PartialDeep<TxActivity>,
  ethPriceUSD: number,
  chainId: string | number
) => number = (
  listing: PartialDeep<TxActivity>,
  ethPriceUSD: number,
  chainId: string | number
) => {
  const currency = getListingCurrencyAddress(listing);
  if (sameAddress(currency, getAddress('dai', chainId)) || sameAddress(currency, getAddress('usdc', chainId))) {
    return Number(ethers.utils.formatUnits(getListingPrice(listing), 18));
  } else if (sameAddress(NULL_ADDRESS, currency) || sameAddress(currency, getAddress('weth', chainId))) {
    return Number(ethers.utils.formatUnits(getListingPrice(listing), 18)) * ethPriceUSD;
  }
  return 0;
};

export const getListingCurrencyAddress = (listing: PartialDeep<TxActivity>) => {
  switch(listing?.order?.protocol) {
  case (ExternalProtocol.LooksRare): {
    const order = listing?.order?.protocolData as LooksrareProtocolData;
    return order?.currencyAddress ?? order?.['currency'];
  }
  case (ExternalProtocol.Seaport): {
    const order = listing?.order?.protocolData as SeaportProtocolData;
    return order?.parameters?.consideration?.[0]?.token;
  }
  case (ExternalProtocol.X2Y2): {
    const order = listing?.order?.protocolData as X2Y2ProtocolData;
    return order?.currencyAddress ?? order?.['currency'];
  }
  case (ExternalProtocol.NFTCOM): {
    const order = listing?.order?.protocolData as NftcomProtocolData;
    return order?.takeAsset[0]?.standard?.contractAddress ?? order?.['currency'];
  }
  }
};

export const getLowestPriceListing = (
  listings: PartialDeep<TxActivity>[],
  ethPriceUSD: number,
  chainId: number | string,
  protocolFilter?: ExternalProtocol
) => {
  if (isNullOrEmpty(listings)) {
    return null;
  }
  const filteredListings = listings.filter(l => protocolFilter == null || l.order?.protocol === protocolFilter);
  let lowestPriceListing = filteredListings[0];
  const lowestPriceUSD = getListingPriceUSD(filteredListings[0], ethPriceUSD, chainId);
  for (let i = 1; i < filteredListings.length; i++) {
    if (getListingPriceUSD(filteredListings[i], ethPriceUSD, chainId) < lowestPriceUSD) {
      lowestPriceListing = filteredListings[i];
    }
  }
  return lowestPriceListing;
};

export const getListingEndDate = (
  listing: PartialObjectDeep<TxActivity, unknown>,
  protocolFilter?: ExternalProtocol
) => {
  const protocolData = listing.order?.protocolData;
  switch(protocolFilter){
  case(ExternalProtocol.NFTCOM):
    return (protocolData as NftcomProtocolData)?.end;
  case(ExternalProtocol.LooksRare):
    return Number((protocolData as LooksrareProtocolData)?.endTime);
  case(ExternalProtocol.Seaport):
    return Number((protocolData as SeaportProtocolData)?.parameters?.endTime);
  case(ExternalProtocol.X2Y2):
    return (protocolData as X2Y2ProtocolData)?.end_at;
  default:
    return null;
  }
};
