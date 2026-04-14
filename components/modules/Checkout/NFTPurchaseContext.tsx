import { NULL_ADDRESS } from 'constants/addresses';
import { LooksrareProtocolData, Nft, NftcomProtocolData, NftType, SeaportProtocolData, X2Y2ProtocolData } from 'graphql/generated/types';
import { useGetSeaportSignature } from 'graphql/hooks/useGetSeaportSignature';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { useLooksrareExchangeContract } from 'hooks/contracts/useLooksrareExchangeContract';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { ExternalProtocol } from 'types';
import { filterDuplicates, filterNulls,isNull, } from 'utils/format';
import { sameAddress } from 'utils/helpers';
import { getBaseUrl } from 'utils/isEnv';
import { getLooksrareHex } from 'utils/looksrareHelpers';
import { getNftcomHex } from 'utils/nativeMarketplaceHelpers';
import { getSeaportHex } from 'utils/seaportHelpers';
import { getX2Y2Hex } from 'utils/X2Y2Helpers';

import { NFTListingsContext } from './NFTListingsContext';
import { PurchaseSummaryModal } from './PurchaseSummaryModal';

import { BigNumber } from '@ethersproject/bignumber';
import { ethers, Signature } from 'ethers';
import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { PartialDeep } from 'type-fest';
import { useAccount, useSigner } from 'wagmi';

export type StagedPurchase = {
  nft: PartialDeep<Nft>;
  activityId: string;
  collectionName: string;
  protocol: ExternalProtocol;
  currency: string;
  price: BigNumber;
  /**
   * purchasers need to give ERC20 approval to the Aggregator contract
   */
  isERC20ApprovedForAggregator: boolean;
  /**
   * purchasers need to give ERC20 approval to the protocol specific contract
   */
  isERC20ApprovedForProtocol: boolean;
  orderHash?: string;
  protocolData: SeaportProtocolData | LooksrareProtocolData | X2Y2ProtocolData | NftcomProtocolData;
  takerAddress: string;
  makerAddress: string;
  nonce: number;
  profileId: string;
}

interface NFTPurchaseContextType {
  toBuy: StagedPurchase[];
  toBuyNow: StagedPurchase[];
  stagePurchase: (listing: PartialDeep<StagedPurchase>) => void;
  stageBuyNow: (listing: PartialDeep<StagedPurchase>) => void;
  clear: () => void;
  clearBuyNow: () => void;
  buyAll: () => Promise<boolean>;
  updateCurrencyApproval: (currency: string, approved: boolean) => void;
  removePurchase: (nft: PartialDeep<Nft>) => void;
  togglePurchaseSummaryModal: () => void;
  buyNowActive: boolean
}

// initialize with default values
export const NFTPurchasesContext = React.createContext<NFTPurchaseContextType>({
  toBuy: [],
  toBuyNow: [],
  stagePurchase: () => null,
  stageBuyNow: () => null,
  clear: () => null,
  clearBuyNow: () => null,
  buyAll: () => null,
  updateCurrencyApproval: () => null,
  removePurchase: () => null,
  togglePurchaseSummaryModal: () => null,
  buyNowActive: false
});

export default function NFTPurchaseContextProvider(
  props: PropsWithChildren<any>
) {
  const [toBuy, setToBuy] = useState<Array<StagedPurchase>>([]);
  const [buyNowActive, setBuyNowActive] = useState<boolean>(false);
  const [toBuyNow, setToBuyNow] = useState<Array<StagedPurchase>>([]);
  const [showPurchaseSummaryModal, setShowPurchaseSummaryModal] = useState(false);

  const { toggleCartSidebar } = useContext(NFTListingsContext);

  const { address: currentAddress } = useAccount();
  const { data: signer } = useSigner();
  const { aggregator } = useAllContracts();
  const looksrareExchange = useLooksrareExchangeContract(signer);
  const defaultChainId = useDefaultChainId();
  const { fetchSeaportSignature } = useGetSeaportSignature();

  useEffect(() => {
    if (window != null) {
      setToBuy(JSON.parse(localStorage.getItem('stagedNftPurchases')) ?? []);
    }
  }, []);

  const togglePurchaseSummaryModal = useCallback(() => {
    setShowPurchaseSummaryModal(!showPurchaseSummaryModal);
  }, [showPurchaseSummaryModal]);

  const fetchAndUpdateSignature = useCallback(async(
    orderHash: string,
    id: string,
    type: 'buy' | 'buyNow'
  ) => {
    fetchSeaportSignature([orderHash]).then((response) => {
      const signature = (response?.getSeaportSignatures[0]?.protocolData as SeaportProtocolData)?.signature;
      if(type === 'buy'){
        setToBuy(toBuy.slice().map(stagedNft => {
          if (id === stagedNft.nft?.id) {
            return {
              ...stagedNft,
              protocolData:{
                ...(stagedNft?.protocolData as SeaportProtocolData),
                signature: signature
              }
            };
          }
          return stagedNft;
        }));
      } else {
        setToBuyNow(toBuyNow.slice().map(stagedNft => {
          if (id === stagedNft.nft?.id) {
            return {
              ...stagedNft,
              protocolData:{
                ...(stagedNft?.protocolData as SeaportProtocolData),
                signature: signature
              }
            };
          }
          return stagedNft;
        }));
      }
    });
  }, [fetchSeaportSignature, toBuy, toBuyNow]);

  useEffect(() => {
    toBuy.forEach((purchase) => {
      if(purchase?.protocol === ExternalProtocol.Seaport && isNull((purchase?.protocolData as SeaportProtocolData)?.signature)){
        fetchAndUpdateSignature(purchase.orderHash, purchase?.nft?.id, 'buy');
      }
    });
  }, [fetchAndUpdateSignature, toBuy, currentAddress]);

  useEffect(() => {
    toBuyNow.forEach((purchase) => {
      if(purchase?.protocol === ExternalProtocol.Seaport && isNull((purchase?.protocolData as SeaportProtocolData)?.signature)){
        fetchAndUpdateSignature(purchase.orderHash, purchase?.nft?.id, 'buyNow');
      }
    });
  }, [fetchAndUpdateSignature, toBuyNow, currentAddress]);

  const stagePurchase = useCallback((
    purchase: StagedPurchase
  ) => {
    if (toBuy.find(l => l.nft.id === purchase.nft.id)) {
      toggleCartSidebar();
      return;
    }
    setToBuy([...toBuy, purchase]);
    localStorage.setItem('stagedNftPurchases', JSON.stringify(filterNulls([...toBuy, purchase])));
  }, [toBuy, toggleCartSidebar]);

  const stageBuyNow = useCallback((
    purchase: StagedPurchase
  ) => {
    setBuyNowActive(true);
    setToBuyNow([purchase]);
  }, []);

  const clearBuyNow = useCallback(() => {
    setBuyNowActive(false);
    setToBuyNow([]);
  }, []);

  const removePurchase = useCallback((nft: PartialDeep<Nft>) => {
    const newToBuy = toBuy.slice().filter(l => l.nft?.id !== nft?.id);
    setToBuy(newToBuy);
    localStorage.setItem('stagedNftPurchases', JSON.stringify(newToBuy));
  }, [toBuy]);

  const clear = useCallback(() => {
    setToBuy([]);
    localStorage.setItem('stagedNftPurchases', null);
  }, []);

  const updateCurrencyApproval = useCallback((currency: string, approved: boolean) => {
    const nftsToApprove = buyNowActive ? toBuyNow : toBuy;
    const newToBuy = nftsToApprove.slice().map(item => {
      if(buyNowActive || nftsToApprove.length === 1){
        return {
          ...item,
          isERC20ApprovedForProtocol: approved
        };
      } else if (item?.currency === currency) {
        return {
          ...item,
          isERC20ApprovedForAggregator: approved
        };
      }
      return item;
    });
    if(buyNowActive){
      setToBuyNow(newToBuy);
    } else {
      setToBuy(newToBuy);
      localStorage.setItem('stagedNftPurchases', JSON.stringify(newToBuy));
    }
  }, [buyNowActive, toBuy, toBuyNow]);

  const fetchX2Y2Hex = useCallback(async (purchase) => {
    const response = await getX2Y2Hex(
      aggregator.address,
      purchase?.protocolData as X2Y2ProtocolData,
      purchase.currency === NULL_ADDRESS ? BigNumber.from(purchase?.price).toString() : '0',
      purchase.nft.type === NftType.Erc1155 ? 'erc1155' : 'erc721',
      purchase.orderHash
    );
    return response;
  },[aggregator.address]);

  const buyAll = useCallback(async () => {
    const allDistinctErc20s: string[] = filterDuplicates(
      toBuy?.filter(purchase => purchase.currency !== NULL_ADDRESS)?.map(purchase => purchase?.currency),
      (first, second) => sameAddress(first, second)
    );
    const erc20Totals: BigNumber[] = allDistinctErc20s?.map(currency => {
      return toBuy?.reduce((sum, purchase) => {
        if (sameAddress(purchase.currency, currency)) {
          return sum.add(BigNumber.from(purchase?.price ?? 0));
        }
        return sum;
      }, BigNumber.from(0));
    });
    const erc20Details = {
      tokenAddrs: allDistinctErc20s,
      amounts: erc20Totals
    };
    const tradeDetails = filterNulls([
      // Looksrare orders are given individually
      ...(toBuy?.filter(purchase => purchase?.protocol === ExternalProtocol.LooksRare)?.map(looksrarePurchase => {
        return getLooksrareHex(
          aggregator.address,
          looksrarePurchase?.protocolData as LooksrareProtocolData,
          looksrareExchange,
          // If this is an ETH listing, we need to specify how much of the the sent ETH (below) should be spent on this specific NFT.
          looksrarePurchase.currency === NULL_ADDRESS ? BigNumber.from(looksrarePurchase?.price).toString() : '0'
        );
      }) ?? []),
      //X2Y2
      ...(await Promise.all(toBuy?.filter(purchase => purchase?.protocol === ExternalProtocol.X2Y2)?.map(X2Y2Purchase => {
        return fetchX2Y2Hex(X2Y2Purchase);
      })))
      ,
      //NFTCOM
      ...(await Promise.all(toBuy?.filter(purchase => purchase?.protocol === ExternalProtocol.NFTCOM)?.map(NftcomPurchase => {
        return getNftcomHex(
          NftcomPurchase.protocolData as NftcomProtocolData & { orderSignature: Signature },
          NftcomPurchase.currency === NULL_ADDRESS ? BigNumber.from(NftcomPurchase?.price).toString() : '0',
          NftcomPurchase.orderHash,
          NftcomPurchase.makerAddress,
          NftcomPurchase.takerAddress,
          NftcomPurchase.activityId,
          defaultChainId,
          NftcomPurchase.nonce,
          ethers.utils.getAddress(currentAddress)
        );
      })))
      ,
      // Seaport orders are combined
      toBuy?.find(purchase => purchase.protocol === ExternalProtocol.Seaport) != null ?
        getSeaportHex(
          ethers.utils.getAddress(currentAddress),
          toBuy
            ?.filter(purchase => purchase?.protocol === ExternalProtocol.Seaport)
            ?.map(purchase => purchase?.protocolData as SeaportProtocolData),
          toBuy
            ?.filter(purchase => purchase?.protocol === ExternalProtocol.Seaport)
            ?.map((purchase) => purchase.currency === NULL_ADDRESS ? BigNumber.from(purchase.price) : BigNumber.from(0)),
        ) :
        null
    ]);

    const tx = await aggregator.batchTrade(
      erc20Details,
      tradeDetails,
      {
        conversionDetails: [],
        dustTokens: [],
        feeDetails: {
          _profileTokenId: 0,
          _wei: 0
        }
      },
      {
        // total WEI to send (for the ETH listings)
        value: toBuy
          .filter(purchase => purchase.currency === NULL_ADDRESS)
          .reduce((sum, purchase) => sum.add(purchase.price), BigNumber.from(0))
      }
    ).catch(() => {
      return null;
    });
    if (tx) {
      fetch(`${getBaseUrl('https://www.nft.com/')}api/message?text=Aggregator Purchase from ${currentAddress} https://www.etherscan.io/tx/${tx.hash}`);
      return await tx.wait(1).then(() => true).catch(() => false);
    }
    return false;
  }, [aggregator, currentAddress, defaultChainId, fetchX2Y2Hex, looksrareExchange, toBuy]);

  return <NFTPurchasesContext.Provider value={{
    removePurchase,
    toBuy,
    toBuyNow,
    stagePurchase,
    stageBuyNow,
    clearBuyNow,
    clear,
    buyAll,
    updateCurrencyApproval,
    togglePurchaseSummaryModal,
    buyNowActive
  }}>
    {showPurchaseSummaryModal && <PurchaseSummaryModal visible={showPurchaseSummaryModal} onClose={() => setShowPurchaseSummaryModal(false)} />}
    {props.children}
  </NFTPurchasesContext.Provider>;
}
