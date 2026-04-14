import { NULL_ADDRESS } from 'constants/addresses';
import { ActivityStatus, LooksrareProtocolData, Maybe, Nft, NftcomProtocolData, NftType, X2Y2ProtocolData } from 'graphql/generated/types';
import { useListNFTMutations } from 'graphql/hooks/useListNFTMutation';
import { useUpdateActivityStatusMutation } from 'graphql/hooks/useUpdateActivityStatusMutation';
import { TransferProxyTarget } from 'hooks/balances/useNftCollectionAllowance';
import { get721Contract } from 'hooks/contracts/get721Contract';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { useLooksrareRoyaltyFeeManagerContractContract } from 'hooks/contracts/useLooksrareRoyaltyFeeManagerContract';
import { useLooksrareRoyaltyFeeRegistryContractContract } from 'hooks/contracts/useLooksrareRoyaltyFeeRegistryContract';
import { useLooksrareStrategyContract } from 'hooks/contracts/useLooksrareStrategyContract';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useEthPriceUSD } from 'hooks/useEthPriceUSD';
import { useSeaportCounter } from 'hooks/useSeaportCounter';
import { useSignLooksrareOrder } from 'hooks/useSignLooksrareOrder';
import { useSignNativeOrder } from 'hooks/useSignNativeOrder';
import { useSignSeaportOrder } from 'hooks/useSignSeaportOrder';
import { SupportedCurrency, useSupportedCurrencies } from 'hooks/useSupportedCurrencies';
import { ExternalProtocol, Fee, SeaportOrderParameters } from 'types';
import { filterNulls, isNullOrEmpty } from 'utils/format';
import { getLowestPriceListing } from 'utils/listingUtils';
import { createLooksrareParametersForNFTListing } from 'utils/looksrareHelpers';
import { getLooksrareNonce, getOpenseaCollection } from 'utils/marketplaceHelpers';
import { convertDurationToSec, convertDurationToSecForNumbersOnly, filterValidListings, SaleDuration } from 'utils/marketplaceUtils';
import { createNativeParametersForNFTListing, onchainAuctionTypeToGqlAuctionType, UnsignedOrder } from 'utils/nativeMarketplaceHelpers';
import { createSeaportParametersForNFTListing } from 'utils/seaportHelpers';
import { createX2Y2ParametersForNFTListing } from 'utils/X2Y2Helpers';

import { CartSidebarTab, NFTCartSidebar } from './NFTCartSidebar';
import { NFTPurchasesContext } from './NFTPurchaseContext';

import { MakerOrder } from '@looksrare/sdk';
import { X2Y2Order } from '@x2y2-io/sdk/dist/types';
import { BigNumber, BigNumberish } from 'ethers';
import moment from 'moment';
import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { PartialDeep } from 'type-fest';
import { useAccount, useProvider, useSigner } from 'wagmi';

export type ListingTarget = {
  protocol: ExternalProtocol,
  startingPrice: BigNumberish;
  endingPrice: BigNumberish;
  currency: string;
  duration: BigNumberish;
  listingError: boolean;
  //Native only listing fields
  auctionType: number;
  buyNowPrice: BigNumberish;
  reservePrice: BigNumberish;
  // these are set when finalizing, before triggering the wallet requests
  looksrareOrder: MakerOrder; // looksrare
  seaportParameters: SeaportOrderParameters; // seaport
  X2Y2Order: X2Y2Order; // X2Y2
  NFTCOMOrder: UnsignedOrder; //native marketplace
}

export type StagedListing = {
  // these are the minimum required fields to add to the staging cart
  nft: PartialDeep<Nft>;
  collectionName: string;
  // these are set in configuration page
  targets: PartialDeep<ListingTarget>[],
  // top-level configs which will apply to all targets, if it exists.
  // if it doesn't, then each target must have a configuration for the listing to be valid.
  startingPrice: BigNumberish;
  endingPrice: BigNumberish;
  currency: string;
  duration: BigNumberish;

  //NFTCOM only listing fields
  auctionType?: number;
  buyNowPrice?: BigNumberish;
  reservePrice?: BigNumberish;

  // for x2y2 order price adjustments
  hasOpenOrder?: boolean;
  openOrderId?: number;
  nftcomOrderId?: string;
  // approval-related data
  isApprovedForSeaport: boolean;
  isApprovedForLooksrare: boolean;
  isApprovedForLooksrare1155: boolean;
  isApprovedForX2Y2: boolean;
  isApprovedForX2Y21155: boolean;
  isApprovedForNFTCOM: boolean;
}

export enum ListAllResult {
  Success = 0,
  SignatureRejected = 1,
  ApiError = 2,
  PartialError = 3
}

export interface NFTListingsContextType {
  toList: StagedListing[];
  stageListing: (listing: PartialDeep<StagedListing>) => void;
  stageListings: (listings: PartialDeep<StagedListing[]>) => void;
  clear: () => void;
  listAll: (itemsToList: StagedListing[], marketplace?: ExternalProtocol) => Promise<ListAllResult>;
  prepareListings: (nonceOverride?: number) => Promise<void>;

  submitting: boolean;
  toggleCartSidebar: (selectedTab?: CartSidebarTab) => void;
  closeCartSidebar: () => void;
  toggleTargetMarketplace: (marketplace: ExternalProtocol, listing?: PartialDeep<StagedListing>, previousSelectedMarketplace?: ExternalProtocol) => void;
  setDuration: (duration: SaleDuration | number) => void;
  setNoExpirationNFTCOM: (noExpiration: boolean) => void;
  noExpirationNFTCOM: boolean;
  setPrice: (listing: PartialDeep<StagedListing>, price: BigNumberish, targetProtocol?: ExternalProtocol, auctionType?: number) => void;
  setEndingPrice: (listing: PartialDeep<StagedListing>, endingPrice: BigNumberish, targetProtocol?: ExternalProtocol, auctionType?: number) => void;
  setCurrency: (listing: PartialDeep<StagedListing>, currency: SupportedCurrency, targetProtocol?: ExternalProtocol) => void;
  setTypeOfAuction: (listing: PartialDeep<StagedListing>, auctionType: number, targetProtocol?: ExternalProtocol) => void;
  setHasListingError: (listing: PartialDeep<StagedListing>, hasError: boolean, targetProtocol?: ExternalProtocol) => void;
  removeListing: (nft: PartialDeep<Nft>) => void;
  approveCollection: (listing: PartialDeep<StagedListing>, target: ExternalProtocol) => Promise<boolean>;
  allListingsConfigured: () => boolean;
  clearGeneralConfig: (listing: PartialDeep<StagedListing>) => void;
  getTarget: (listing: PartialDeep<StagedListing>, protocol: ExternalProtocol) => Maybe<PartialDeep<ListingTarget>>;
  setDecreasingPriceError:(value: boolean) => void;
  decreasingPriceError: boolean;
  setEnglishAuctionError:(value: boolean) => void;
  englishAuctionError: boolean;
  allListingsFail: boolean;
  setAllListingsFail: (value: boolean) => void;
}

// initialize with default values
export const NFTListingsContext = React.createContext<NFTListingsContextType>({
  toList: [],
  stageListing: () => null,
  stageListings: () => null,
  clear: () => null,
  listAll: () => null,
  prepareListings: () => null,
  submitting: false,
  toggleCartSidebar: () => null,
  closeCartSidebar: () => null,
  toggleTargetMarketplace: () => null,
  setDuration: () => null,
  setNoExpirationNFTCOM: () => null,
  noExpirationNFTCOM: false,
  setPrice: () => null,
  setEndingPrice: () => null,
  setCurrency: () => null,
  setTypeOfAuction: () => null,
  setHasListingError: () => null,
  removeListing: () => null,
  approveCollection: () => null,
  allListingsConfigured: () => false,
  clearGeneralConfig: () => null,
  getTarget: () => null,
  setDecreasingPriceError: () => null,
  decreasingPriceError: false,
  setEnglishAuctionError: () => null,
  englishAuctionError: false,
  allListingsFail: false,
  setAllListingsFail: () => null
});

/**
 * This context provides state management and helper functions for the NFT listings cart.
 */
export default function NFTListingsContextProvider(
  props: PropsWithChildren<any>
) {
  const [toList, setToList] = useState<Array<StagedListing>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  // If all listings fail, this toggles the error messaging on listing page
  const [allListingsFail, setAllListingsFail] = useState(false);

  const { toBuy } = useContext(NFTPurchasesContext);
  const { updateActivityStatus } = useUpdateActivityStatusMutation();
  const { data: supportedCurrencyData } = useSupportedCurrencies();
  const { marketplace } = useAllContracts();

  useEffect(() => {
    if (window != null) {
      const initialValue = JSON.parse(localStorage.getItem('stagedNftListings')) ?? [];
      setToList(initialValue);
    }
  }, []);

  const { address: currentAddress } = useAccount();
  const defaultChainId = useDefaultChainId();
  const ethPriceUSD = useEthPriceUSD();
  const provider = useProvider();
  const { data: signer } = useSigner();

  const [selectedTab, setSelectedTab] = useState<CartSidebarTab>('Buy');
  const [noExpirationNFTCOM, setNoExpirationNFTCOM] = useState(false);
  const [decreasingPriceError, setDecreasingPriceError] = useState(false);
  const [englishAuctionError, setEnglishAuctionError] = useState(false);

  const signOrderForLooksrare = useSignLooksrareOrder();
  const looksrareRoyaltyFeeRegistry = useLooksrareRoyaltyFeeRegistryContractContract(provider);
  const looksrareStrategy = useLooksrareStrategyContract(provider);
  const looksrareRoyaltyFeeManager = useLooksrareRoyaltyFeeManagerContractContract(provider);

  const seaportCounter = useSeaportCounter(currentAddress);
  const signOrderForSeaport = useSignSeaportOrder();
  const { listNftSeaport, listNftLooksrare, listNftX2Y2, listNftNative } = useListNFTMutations();

  const signOrderForNativeMarketPlace = useSignNativeOrder();
  const { getByContractAddress } = useSupportedCurrencies();

  const stageListing = useCallback((
    listing: StagedListing
  ) => {
    if (toList.find(l => l.nft.id === listing.nft.id)) {
      setSidebarVisible(true);
      return;
    }
    setToList([...toList, listing]);
    localStorage.setItem('stagedNftListings', JSON.stringify(filterNulls([...toList, listing])));
  }, [toList]);

  const stageListings = useCallback((
    listings: StagedListing[]
  ) => {
    const filterListings = listings?.filter(a => !toList?.some(b => b.nft.id === a.nft.id));
    setToList([...toList, ...filterListings]);

    localStorage.setItem('stagedNftListings', JSON.stringify(filterNulls([...toList, ...listings])));
  }, [toList]);

  const clear = useCallback(() => {
    setToList([]);
    localStorage.setItem('stagedNftListings', null);
  }, []);

  const toggleCartSidebar = useCallback((selectedTab?: 'Buy' | 'Sell') => {
    setSidebarVisible(!sidebarVisible);
    setSelectedTab(selectedTab ?? (toBuy?.length > 0 ? 'Buy' : 'Sell'));
  }, [sidebarVisible, toBuy]);

  const closeCartSidebar = useCallback(() => {
    setSidebarVisible(false);
  }, []);

  const decreasingPriceErrorEnabled = useCallback((decresingPriceinvalidInputs: boolean) => {
    setDecreasingPriceError(decresingPriceinvalidInputs);
  }, []);

  const englishAuctionPriceErrorEnabled = useCallback((englishAuctionPriceinvalidInputs: boolean) => {
    setEnglishAuctionError(englishAuctionPriceinvalidInputs);
  }, []);

  const allListingsConfigured = useCallback(() => {
    const unconfiguredNft = toList.find((stagedNft: StagedListing) => {
      const lowestX2Y2Listing = getLowestPriceListing(filterValidListings(stagedNft?.nft?.listings?.items), ethPriceUSD, defaultChainId, ExternalProtocol.X2Y2);
      const lowestLooksrareListing = getLowestPriceListing(filterValidListings(stagedNft?.nft?.listings?.items), ethPriceUSD, defaultChainId, ExternalProtocol.LooksRare);
      const lowestNftcomListing = getLowestPriceListing(filterValidListings(stagedNft?.nft?.listings?.items), ethPriceUSD, defaultChainId, ExternalProtocol.NFTCOM);
      if (stagedNft?.nft == null || isNullOrEmpty(stagedNft?.targets)) {
        return true; // no targets or NFT to list?
      }
      const hasX2Y2LowerListing = (parseInt((lowestX2Y2Listing?.order?.protocolData as X2Y2ProtocolData)?.price) < Number(stagedNft?.targets?.find(target => target.protocol === ExternalProtocol.X2Y2) && stagedNft?.startingPrice)) ||(parseInt((lowestX2Y2Listing?.order?.protocolData as X2Y2ProtocolData)?.price) < Number(stagedNft?.targets?.find(target => target.protocol === ExternalProtocol.X2Y2)?.startingPrice));
      const hasLooksrareLowerListing = (parseInt((lowestLooksrareListing?.order?.protocolData as LooksrareProtocolData)?.price) < Number(stagedNft?.targets?.find(target => target.protocol === ExternalProtocol.LooksRare) && stagedNft?.startingPrice)) ||(parseInt((lowestLooksrareListing?.order?.protocolData as LooksrareProtocolData)?.price) < Number(stagedNft?.targets?.find(target => target.protocol === ExternalProtocol.LooksRare)?.startingPrice));
      const hasNftcomLowerListing = (parseInt((lowestNftcomListing?.order?.protocolData as NftcomProtocolData)?.takeAsset[0].value) < Number(stagedNft?.targets?.find(target => target.protocol === ExternalProtocol.NFTCOM) && stagedNft?.startingPrice)) ||(parseInt((lowestNftcomListing?.order?.protocolData as NftcomProtocolData)?.takeAsset[0].value) < Number(stagedNft?.targets?.find(target => target.protocol === ExternalProtocol.NFTCOM)?.startingPrice));

      if(hasX2Y2LowerListing || hasLooksrareLowerListing || hasNftcomLowerListing) {
        return true;
      }
      const hasGeneralConfig = stagedNft.startingPrice != null &&
        !BigNumber.from(stagedNft.startingPrice).eq(0) &&
        stagedNft.duration != null &&
        !isNullOrEmpty(stagedNft.currency);
      if (hasGeneralConfig) {
        return false; // this listing is valid.
      }
      const unconfiguredTarget = stagedNft.targets.find((target: ListingTarget) => {
        const decresingPriceinvalidInputs = target.protocol === ExternalProtocol.NFTCOM && target.auctionType == 2 &&
        ((target.endingPrice == null || BigNumber.from(target.endingPrice).eq(0)) ||
        (target.endingPrice && target.startingPrice && (Number(target.startingPrice) <= Number(target.endingPrice))));
        decreasingPriceErrorEnabled(decresingPriceinvalidInputs);

        const englishAuctionPriceinvalidInputs = target.protocol === ExternalProtocol.NFTCOM && target.auctionType == 1 &&
        ((target.buyNowPrice == null || BigNumber.from(target.buyNowPrice).eq(0)) ||
        (target.buyNowPrice && target.reservePrice && (Number(target.reservePrice) > Number(target.buyNowPrice))));
        englishAuctionPriceErrorEnabled(englishAuctionPriceinvalidInputs);

        return target.startingPrice == null || BigNumber.from(target.startingPrice).eq(0) ||
          (target.duration ?? stagedNft.duration) == null ||
          isNullOrEmpty(target.currency) || (target.protocol === ExternalProtocol.NFTCOM && target.auctionType == null) || decresingPriceinvalidInputs || englishAuctionPriceinvalidInputs;
      });
      // At this point, we need all targets to have valid individual configurations.
      return unconfiguredTarget != null;
    });
    return unconfiguredNft == null;
  }, [decreasingPriceErrorEnabled, defaultChainId, englishAuctionPriceErrorEnabled, ethPriceUSD, toList]);

  const toggleTargetMarketplace = useCallback((targetMarketplace: ExternalProtocol, toggleListing?: PartialDeep<StagedListing>, previousSelectedMarketplace?: ExternalProtocol) => {
    const targetFullyEnabled = toList.find(nft => {
      const hasTarget = nft.targets?.find(target => target.protocol === targetMarketplace) != null;
      return !hasTarget; // return true if missing the desired target.
    }) == null; // target is fully enabled if we didn't find an NFT that was missing it.
    if (toggleListing) {
      // toggle the marketplace for a specific listing.
      setToList(toList.slice().map(stagedNft => {
        if (toggleListing?.nft?.id === stagedNft?.nft?.id) {
          if (previousSelectedMarketplace) {// switch to another marketplace
            return {
              ...stagedNft,
              targets: stagedNft.targets.map(target => {
                if(target.protocol === previousSelectedMarketplace) {
                  return {
                    protocol: targetMarketplace,
                    duration: stagedNft.duration,
                    currency: stagedNft.currency ?? targetMarketplace === ExternalProtocol.X2Y2 ? supportedCurrencyData['ETH'].contract : supportedCurrencyData['WETH'].contract,
                    startingPrice: target.startingPrice,
                    listingError: false
                  };
                }
                return target;
              })
            };
          } else {
            return {
              ...stagedNft,
              targets: stagedNft.targets.find(target => target.protocol === targetMarketplace) != null ?
                stagedNft.targets.filter(target => target.protocol !== targetMarketplace) :
                [
                  ...stagedNft.targets,
                  {
                    protocol: targetMarketplace,
                    duration: stagedNft.duration,
                    currency: stagedNft.currency ?? targetMarketplace === ExternalProtocol.X2Y2 ? supportedCurrencyData['ETH'].contract : supportedCurrencyData['WETH'].contract,
                    listingError: false
                  }
                ]
            };
          }
        }
        return stagedNft;
      }));
    } else if (targetFullyEnabled) {
      // removing the target marketplace from all nfts
      setToList(toList.slice().map(stagedNft => {
        return {
          ...stagedNft,
          targets: stagedNft.targets?.filter(t => t.protocol !== targetMarketplace) ?? [],
        };
      }));
    } else {
      // adding a new marketplace to any nft that doesn't have it.
      setToList(toList.slice().map(stagedNft => {
        return {
          ...stagedNft,
          targets: stagedNft.targets?.find(target => target.protocol === targetMarketplace) != null ?
            stagedNft.targets :
            [
              ...stagedNft.targets ?? [],
              {
                protocol: targetMarketplace,
                duration: stagedNft.duration ,
                currency: stagedNft.currency ?? (targetMarketplace === ExternalProtocol.X2Y2 || targetMarketplace === ExternalProtocol.NFTCOM) ? supportedCurrencyData['ETH'].contract : supportedCurrencyData['WETH'].contract,
                listingError: false
              }
            ],
        };
      }));
    }
  }, [supportedCurrencyData, toList]);

  const setDuration = useCallback((duration: SaleDuration | number) => {
    setToList(toList.slice().map(stagedNft => {
      return {
        ...stagedNft,
        duration: typeof(duration) === 'number' ? convertDurationToSecForNumbersOnly(duration) : convertDurationToSec(duration),
        targets: stagedNft.targets.slice().map(target => {
          return {
            ...target,
            duration: typeof(duration) === 'number' ? convertDurationToSecForNumbersOnly(duration) : convertDurationToSec(duration),
          };
        })
      };
    }));
  }, [toList]);

  const setPrice = useCallback((
    listing: PartialDeep<StagedListing>,
    price: Maybe<BigNumberish>,
    targetProtocol?: ExternalProtocol,
    auctionType?: number,
  ) => {
    setToList(toList.slice().map(stagedNft => {
      if (listing?.nft?.id === stagedNft.nft?.id) {
        return {
          ...stagedNft,
          startingPrice: targetProtocol == null ? price : stagedNft.startingPrice,
          auctionType: auctionType == null ? null : targetProtocol == null ? auctionType : stagedNft.auctionType,
          reservePrice: auctionType == null ? null : targetProtocol == null ? price : stagedNft.reservePrice,
          currency: targetProtocol == null ? (stagedNft.currency ?? supportedCurrencyData['WETH'].contract) : null,
          targets: stagedNft.targets.slice().map(target => {
            if (targetProtocol === target.protocol) {
              if (!auctionType) {
                return {
                  ...target,
                  startingPrice: price,
                  currency: target.
                    currency ?? supportedCurrencyData['WETH'].contract
                };
              } else {
                if (auctionType == 0) {
                  return {
                    ...target,
                    startingPrice: price,
                    endingPrice: null,
                    buyNowPrice: null,
                    reservePrice: null,
                    currency: target.
                      currency ?? supportedCurrencyData['WETH'].contract
                  };
                }
                if (auctionType == 1) {
                  return {
                    ...target,
                    startingPrice: null,
                    reservePrice: price,
                    currency: target.
                      currency ?? supportedCurrencyData['WETH'].contract
                  };
                }
                if (auctionType == 2) {
                  return {
                    ...target,
                    startingPrice: price,
                    reservePrice: null,
                    currency: target.
                      currency ?? supportedCurrencyData['WETH'].contract
                  };
                }
              }
            } else {
              return target;
            }
          })
        };
      }
      return stagedNft;
    }));
  }, [supportedCurrencyData, toList]);

  const setEndingPrice = useCallback((
    listing: PartialDeep<StagedListing>,
    price: Maybe<BigNumberish>,
    targetProtocol?: ExternalProtocol,
    auctionType?: number,
  ) => {
    setToList(toList.slice().map(stagedNft => {
      if (listing?.nft?.id === stagedNft.nft?.id) {
        return {
          ...stagedNft,
          endPrice: targetProtocol == null ? price : stagedNft.endingPrice,
          auctionType: auctionType == null ? null : targetProtocol == null ? auctionType : stagedNft.auctionType,
          buyNowPrice: auctionType == null ? null : targetProtocol == null ? price : stagedNft.buyNowPrice,
          currency: targetProtocol == null ? (stagedNft.currency ?? supportedCurrencyData['WETH'].contract) : null,
          targets: stagedNft.targets.slice().map(target => {
            if (targetProtocol === target.protocol) {
              if (!auctionType) {
                return {
                  ...target,
                  endingPrice: price,
                  currency: target.
                    currency ?? supportedCurrencyData['WETH'].contract
                };
              } else {
                if (auctionType == 1) {
                  return {
                    ...target,
                    endingPrice: null,
                    buyNowPrice: price,
                    currency: target.
                      currency ?? supportedCurrencyData['WETH'].contract
                  };
                }
                if (auctionType == 2) {
                  return {
                    ...target,
                    endingPrice: price,
                    buyNowPrice: null,
                    currency: target.
                      currency ?? supportedCurrencyData['WETH'].contract
                  };
                }
              }
            } else {
              return target;
            }
          })
        };
      }
      return stagedNft;
    }));
  }, [supportedCurrencyData, toList]);

  const setCurrency = useCallback((
    listing: PartialDeep<StagedListing>,
    currency: SupportedCurrency,
    targetProtocol?: ExternalProtocol
  ) => {
    setToList(toList.slice().map(stagedNft => {
      if (listing?.nft?.id === stagedNft.nft?.id) {
        return {
          ...stagedNft,
          currency: targetProtocol == null ? supportedCurrencyData[currency].contract : null,
          targets: stagedNft.targets.slice().map(target => {
            if (targetProtocol === target.protocol) {
              return {
                ...target,
                currency: supportedCurrencyData[currency].contract,
              };
            } else {
              return {
                ...target,
                currency: target.currency ?? supportedCurrencyData['WETH'].contract
              };
            }
          })
        };
      }
      return stagedNft;
    }));
  }, [supportedCurrencyData, toList]);

  const setTypeOfAuction = useCallback((
    listing: PartialDeep<StagedListing>,
    auctionType: number,
    targetProtocol?: ExternalProtocol
  ) => {
    setToList(toList.slice().map(stagedNft => {
      if (listing?.nft?.id === stagedNft.nft?.id) {
        return {
          ...stagedNft,
          auctionType,
          targets: stagedNft.targets.slice().map(target => {
            if (targetProtocol === target.protocol) {
              return {
                ...target,
                auctionType,
              };
            } else {
              return {
                ...target,
                auctionType: target.auctionType
              };
            }
          })
        };
      }
      return stagedNft;
    }));
  }, [toList]);

  const setHasListingError = useCallback((
    listing: PartialDeep<StagedListing>,
    hasError: boolean,
    targetProtocol?: ExternalProtocol,
  ) => {
    setToList(toList.slice().map(stagedNft => {
      if (listing?.nft?.id === stagedNft.nft?.id) {
        return {
          ...stagedNft,
          targets: stagedNft.targets.slice().map(target => {
            if (targetProtocol === target.protocol) {
              return {
                ...target,
                listingError: hasError
              };
            } else {
              return target;
            }
          })
        };
      }
      return stagedNft;
    }));
  }, [toList]);

  const clearGeneralConfig = useCallback((
    listing: PartialDeep<StagedListing>,
  ) => {
    setToList(toList.slice().map(stagedNft => {
      if (listing?.nft?.id === stagedNft?.nft?.id) {
        return {
          ...stagedNft,
          startingPrice: null,
          currency: null,
        };
      }
      return stagedNft;
    }));
  }, [toList]);

  const getTarget = useCallback((listing: PartialDeep<StagedListing>, protocol: ExternalProtocol) => {
    return toList?.find(l => l.nft.id === listing.nft.id)?.targets?.find(target => target.protocol === protocol);
  }, [toList]);

  const prepareListings = useCallback(async (nonceOverride?: number) => {
    let nonce: number = nonceOverride;
    if (nonce == null) {
      nonce = await getLooksrareNonce(currentAddress);
    }
    const preparedListings = await Promise.all(toList.map(async (stagedNft) => {
      const preparedTargets: ListingTarget[] = await Promise.all(stagedNft.targets?.map(async (target: ListingTarget) => {
        if (target.protocol === ExternalProtocol.LooksRare) {
          const order: MakerOrder = await createLooksrareParametersForNFTListing(
            currentAddress, // offerer
            stagedNft.nft,
            stagedNft.startingPrice ?? target.startingPrice,
            supportedCurrencyData['WETH'].contract,
            Number(defaultChainId),
            nonce,
            looksrareStrategy,
            looksrareRoyaltyFeeRegistry,
            target.duration ?? stagedNft.duration,
            looksrareRoyaltyFeeManager
            // listing.takerAddress
          );
          return {
            ...target,
            looksrareOrder: order,
          };
        } else if (target.protocol === ExternalProtocol.X2Y2) {
          return target;
        } else if (target.protocol === ExternalProtocol.NFTCOM) {
          target.duration = noExpirationNFTCOM ? 0 : target.duration;
          const nonce = await marketplace.nonces(currentAddress);
          const order = await createNativeParametersForNFTListing(
            currentAddress,
            isNullOrEmpty(target?.NFTCOMOrder?.taker) ? NULL_ADDRESS : target?.NFTCOMOrder?.taker,
            noExpirationNFTCOM ? 0 : (Number(target.duration) ?? Number(stagedNft.duration)),
            onchainAuctionTypeToGqlAuctionType(target.auctionType),
            stagedNft.nft,
            Number(nonce),
            getByContractAddress(target?.currency).contract,
            target.startingPrice as BigNumber,
            target.endingPrice as BigNumber || null,
            target.buyNowPrice as BigNumber || null,
            target.reservePrice as BigNumber || null,
            stagedNft.currency ?? target.currency,
            noExpirationNFTCOM
          );
          return {
            ...target,
            NFTCOMOrder: order,
          };
        } else {
          const contract = await getOpenseaCollection(stagedNft?.nft?.contract);
          const collectionFee: Fee = contract?.['payout_address'] && contract?.['dev_seller_fee_basis_points']
            ? {
              recipient: contract?.['payout_address'],
              basisPoints: contract?.['dev_seller_fee_basis_points'],
            }
            : null;
          const parameters: SeaportOrderParameters = createSeaportParametersForNFTListing(
            currentAddress,
            stagedNft.nft,
            stagedNft.startingPrice ?? target.startingPrice,
            (stagedNft?.endingPrice ?? target.endingPrice) ?? (stagedNft.startingPrice ?? target.startingPrice),
            stagedNft.currency ?? target.currency,
            stagedNft.duration ?? target.duration,
            collectionFee
          );
          return {
            ...target,
            seaportParameters: parameters,
          };
        }
      }));

      return {
        ...stagedNft,
        targets: preparedTargets
      };
    }));
    setToList(preparedListings);
  }, [toList, currentAddress, supportedCurrencyData, defaultChainId, looksrareStrategy, looksrareRoyaltyFeeRegistry, looksrareRoyaltyFeeManager, noExpirationNFTCOM, marketplace, getByContractAddress]);

  const listAll: (itemsToList: StagedListing[], marketplace?: ExternalProtocol) => Promise<ListAllResult> = useCallback(async (itemsToList, marketplace) => {
    setSubmitting(true);
    const results = await Promise.all(itemsToList.map(async (listing: StagedListing) => {
      const results = await Promise.all(listing.targets?.map(async (target: ListingTarget) => {
        if (isNullOrEmpty(marketplace) ? target.protocol === ExternalProtocol.LooksRare : target.protocol === ExternalProtocol.LooksRare && marketplace === ExternalProtocol.LooksRare) {
          const signature = await signOrderForLooksrare(target.looksrareOrder).catch(() => null);
          if (isNullOrEmpty(signature)) {
            setHasListingError(listing, true, ExternalProtocol.LooksRare);
            return ListAllResult.SignatureRejected;
          }
          const result = await listNftLooksrare({ ...target.looksrareOrder, signature });
          if (!result) {
            setHasListingError(listing, true, ExternalProtocol.LooksRare);
            return ListAllResult.ApiError;
          }
          if (result && listing?.hasOpenOrder && listing?.nftcomOrderId) {
            updateActivityStatus([listing?.nftcomOrderId], ActivityStatus.Cancelled);
          }
          return ListAllResult.Success;
        } else if (isNullOrEmpty(marketplace) ? target.protocol === ExternalProtocol.X2Y2 : target.protocol === ExternalProtocol.X2Y2 && marketplace === ExternalProtocol.X2Y2) {
          const order: X2Y2Order = await createX2Y2ParametersForNFTListing(
            'mainnet',
            signer,
            listing.nft.contract,
            listing.nft.tokenId,
            listing.nft.type === NftType.Erc1155 ? 'erc1155' : 'erc721',
            !isNullOrEmpty(listing?.startingPrice?.toString()) ? listing.startingPrice.toString() : target.startingPrice.toString(),
            moment().unix() + Number(listing.duration) ?? moment().unix() + Number(target.duration)
          );
          if(isNullOrEmpty(order.r) || isNullOrEmpty(order.s) || isNullOrEmpty(order.v.toString())){
            setHasListingError(listing, true, ExternalProtocol.X2Y2);
            return ListAllResult.SignatureRejected;
          }
          const result = await listNftX2Y2(
            { ...order },
            listing.nft.tokenId,
            listing.nft.contract,
            currentAddress,
            listing?.hasOpenOrder ?? false,
            listing?.openOrderId ? [listing?.openOrderId] : []
          );
          if (!result) {
            setHasListingError(listing, true, ExternalProtocol.X2Y2);
            return ListAllResult.ApiError;
          }
          if (result && listing?.hasOpenOrder && listing?.nftcomOrderId) {
            updateActivityStatus([listing?.nftcomOrderId], ActivityStatus.Cancelled);
          }
          return ListAllResult.Success;
        } else if (isNullOrEmpty(marketplace) ? target.protocol === ExternalProtocol.NFTCOM : target.protocol === ExternalProtocol.NFTCOM && marketplace === ExternalProtocol.NFTCOM) {
          const signature = await signOrderForNativeMarketPlace(target.NFTCOMOrder).catch(() => null);
          if (isNullOrEmpty(signature)) {
            setHasListingError(listing, true, ExternalProtocol.NFTCOM);
            return ListAllResult.SignatureRejected;
          }
          const result = await listNftNative(target, signature, listing.nft);
          if (!result) {
            setHasListingError(listing, true, ExternalProtocol.NFTCOM);
            return ListAllResult.ApiError;
          }
          if (result && listing?.hasOpenOrder && listing?.nftcomOrderId) {
            updateActivityStatus([listing?.nftcomOrderId], ActivityStatus.Cancelled);
          }
          return ListAllResult.Success;
        } else if (isNullOrEmpty(marketplace) ? target.protocol === ExternalProtocol.Seaport : target.protocol === ExternalProtocol.Seaport && marketplace === ExternalProtocol.Seaport) {
          const signature = await signOrderForSeaport(target.seaportParameters, seaportCounter).catch(() => null);
          if (isNullOrEmpty(signature)) {
            setHasListingError(listing, true, ExternalProtocol.Seaport);
            return ListAllResult.SignatureRejected;
          }
          const result = await listNftSeaport(signature , { ...target.seaportParameters, counter: seaportCounter });
          if (!result) {
            setHasListingError(listing, true, ExternalProtocol.Seaport);
            return ListAllResult.ApiError;
          }
          return ListAllResult.Success;
        }
      }));
      return (results.includes(ListAllResult.ApiError) || results.includes(ListAllResult.SignatureRejected)) && results.includes(ListAllResult.Success)
        ? ListAllResult.PartialError :
        results.includes(ListAllResult.SignatureRejected) ?
          ListAllResult.SignatureRejected :
          results.includes(ListAllResult.ApiError) ?
            ListAllResult.ApiError :
            ListAllResult.Success;
    }));
    setSubmitting(false);
    return ((results.includes(ListAllResult.ApiError) || results.includes(ListAllResult.SignatureRejected)) && results.includes(ListAllResult.Success)) || results.includes(ListAllResult.PartialError) ?
      ListAllResult.PartialError :
      results.includes(ListAllResult.SignatureRejected) ?
        ListAllResult.SignatureRejected :
        results.includes(ListAllResult.ApiError) ?
          ListAllResult.ApiError :
          ListAllResult.Success;
  }, [signOrderForLooksrare, listNftLooksrare, setHasListingError, updateActivityStatus, signer, listNftX2Y2, currentAddress, signOrderForNativeMarketPlace, listNftNative, signOrderForSeaport, seaportCounter, listNftSeaport]);

  const removeListing = useCallback((nft: PartialDeep<Nft>) => {
    const newToList = toList.slice().filter(l => l.nft?.id !== nft?.id);
    setToList(newToList);
    localStorage.setItem('stagedNftListings', JSON.stringify(newToList));
  }, [toList]);

  const approveCollection = useCallback(async (listing: StagedListing, target: ExternalProtocol) => {
    const collection = get721Contract(listing?.nft?.contract, provider);
    if (collection == null) {
      return false;
    }
    const tx = await collection
      .connect(signer)
      .setApprovalForAll(target === ExternalProtocol.LooksRare ?
        listing?.nft?.type == NftType.Erc721 ?
          TransferProxyTarget.LooksRare :
          TransferProxyTarget.LooksRare1155 :
        target === ExternalProtocol.X2Y2 ?
          listing?.nft?.type == NftType.Erc721 ?
            TransferProxyTarget.X2Y2 :
            TransferProxyTarget.X2Y21155 :
          target === ExternalProtocol.NFTCOM?
            TransferProxyTarget.NFTCOM :
            TransferProxyTarget.Opensea,
      true);
    if (tx) {
      return await tx.wait(1).then(() => {
        const newToList = toList.slice().map(l => {
          if (listing?.nft?.id === l.nft?.id) {
            return {
              ...listing,
              ...(target === ExternalProtocol.LooksRare ?
                listing?.nft?.type == NftType.Erc721 ?
                  { isApprovedForLooksrare: true } :
                  { isApprovedForLooksrare1155: true } :
                {}),
              ...(target === ExternalProtocol.Seaport ? { isApprovedForSeaport: true } : {}),
              ...(target === ExternalProtocol.X2Y2 ?
                listing?.nft?.type == NftType.Erc721 ?
                  { isApprovedForX2Y2: true } :
                  { isApprovedForX2Y21155: true } :
                {}),
              ...(target === ExternalProtocol.NFTCOM ? { isApprovedForNFTCOM: true } : {}),
            };
          }
          return l;
        });
        setToList(newToList);
        localStorage.setItem('stagedNftListings', JSON.stringify(newToList));
        return true;
      });
    }
    return false;
  }, [provider, signer, toList]);

  return <NFTListingsContext.Provider value={{
    approveCollection,
    removeListing,
    toList,
    stageListing,
    stageListings,
    clear,
    listAll,
    prepareListings,
    submitting,
    toggleCartSidebar,
    closeCartSidebar,
    toggleTargetMarketplace,
    setDuration,
    setNoExpirationNFTCOM,
    noExpirationNFTCOM,
    setPrice,
    setEndingPrice,
    setCurrency,
    setTypeOfAuction,
    setHasListingError,
    allListingsConfigured,
    clearGeneralConfig,
    getTarget,
    setDecreasingPriceError,
    decreasingPriceError,
    setEnglishAuctionError,
    englishAuctionError,
    allListingsFail,
    setAllListingsFail
  }}>

    {
      sidebarVisible &&
      <NFTCartSidebar selectedTab={selectedTab} onChangeTab={setSelectedTab} />
    }
    {props.children}
  </NFTListingsContext.Provider>;
}
