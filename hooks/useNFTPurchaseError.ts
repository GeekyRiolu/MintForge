import { NFTPurchasesContext } from 'components/modules/Checkout/NFTPurchaseContext';
import { LooksrareProtocolData, NftcomProtocolData, SeaportProtocolData, X2Y2ProtocolData } from 'graphql/generated/types';
import { ExternalProtocol } from 'types';
import { hasSufficientBalances } from 'utils/marketplaceUtils';

import { useSupportedCurrencies } from './useSupportedCurrencies';

import moment from 'moment';
import { useCallback, useContext } from 'react';
import { useAccount } from 'wagmi';

export type PurchaseErrorResponse = {
  error: 'ApprovalError' | 'PurchaseUnknownError' | 'PurchaseBalanceError' | 'ConnectionError' | 'ListingExpiredError'
}

export default function useNFTPurchaseError() {
  const { address: currentAddress } = useAccount();
  const { getBalanceMap } = useSupportedCurrencies();
  const {
    toBuy,
    toBuyNow,
    buyNowActive
  } = useContext(NFTPurchasesContext);

  const nftsToBuy = buyNowActive ? toBuyNow : toBuy;

  const getHasSufficientBalance = useCallback(async () => {
    const balances = await getBalanceMap(currentAddress, ['WETH', 'ETH', 'USDC', 'DAI']);
    return hasSufficientBalances(nftsToBuy, balances);
  }, [currentAddress, getBalanceMap, nftsToBuy]);

  const getHasListingExpiredError = useCallback(() => {
    const listingExpiredError = nftsToBuy.some((nft) => {
      const now = moment().unix();
      const protocolData = nft.protocolData;
      const endDate = nft.protocol === ExternalProtocol.LooksRare
        ? Number((protocolData as LooksrareProtocolData)?.endTime) :
        nft.protocol === ExternalProtocol.Seaport
          ? Number((protocolData as SeaportProtocolData)?.parameters?.endTime) :
          nft.protocol === ExternalProtocol.X2Y2
            ? (protocolData as X2Y2ProtocolData)?.end_at :
            (protocolData as NftcomProtocolData)?.end;
      //if end date is before 'now' then the listing is expired
      return now > endDate;
    });

    return listingExpiredError;
  }, [nftsToBuy]);

  const purchaseError = useCallback(async() : Promise<PurchaseErrorResponse['error']> => {
    const hasSufficientBalance = await getHasSufficientBalance();
    const hasExpiredListingError = getHasListingExpiredError();
    if (!hasSufficientBalance) {
      return 'PurchaseBalanceError';
    } else if(hasExpiredListingError){
      return 'ListingExpiredError';
    } else {
      return 'PurchaseUnknownError';
    }
  }, [getHasListingExpiredError, getHasSufficientBalance]);

  return purchaseError;
}
