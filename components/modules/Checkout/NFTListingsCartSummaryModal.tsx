import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { Modal } from 'components/elements/Modal';
import { Maybe, NftType } from 'graphql/generated/types';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { useLooksrareStrategyContract } from 'hooks/contracts/useLooksrareStrategyContract';
import { useHasGk } from 'hooks/useHasGk';
import { useMyNftProfileTokens } from 'hooks/useMyNftProfileTokens';
import { useNftComRoyalties } from 'hooks/useNftComRoyalties';
import { useSupportedCurrencies } from 'hooks/useSupportedCurrencies';
import { useX2Y2Royalties } from 'hooks/useX2Y2Royalties';
import { ExternalProtocol } from 'types';
import { filterDuplicates, isNullOrEmpty } from 'utils/format';
import { getMaxMarketplaceFeesUSD, getMaxRoyaltyFeesUSD, getProtocolDisplayName } from 'utils/marketplaceUtils';

import { CheckoutSuccessView, SuccessType } from './CheckoutSuccessView';
import { ListAllResult, ListingTarget, NFTListingsContext } from './NFTListingsContext';
import { ProgressBarItem, VerticalProgressBar } from './VerticalProgressBar';

import * as Sentry from '@sentry/nextjs';
import { BigNumber, ethers } from 'ethers';
import { useRouter } from 'next/router';
import { CheckCircle, SpinnerGap, X } from 'phosphor-react';
import LooksrareIcon from 'public/icons/looksrare-icon.svg?svgr';
import NFTLogo from 'public/icons/nft_logo_yellow.svg?svgr';
import OpenseaIcon from 'public/icons/opensea-icon.svg?svgr';
import X2Y2Icon from 'public/icons/x2y2-icon.svg?svgr';
import { useCallback, useContext, useState } from 'react';
import useSWR from 'swr';
import { useAccount, useProvider, useSigner } from 'wagmi';

export interface NFTListingsCartSummaryModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NFTListingsCartSummaryModal(props: NFTListingsCartSummaryModalProps) {
  const {
    toList,
    listAll,
    approveCollection,
    clear,
    closeCartSidebar,
    allListingsConfigured,
    setAllListingsFail,
  } = useContext(NFTListingsContext);
  const provider = useProvider();
  const router = useRouter();
  const looksrareStrategy = useLooksrareStrategyContract(provider);
  const { data: signer } = useSigner();
  const { address: currentAddress } = useAccount();
  const { data: toListNftComRoyaltyFees } = useNftComRoyalties(toList);
  const { data: x2y2Fees } = useX2Y2Royalties(toList);
  const { getByContractAddress } = useSupportedCurrencies();
  const { marketplace } = useAllContracts();
  const { profileTokens: myOwnedProfileTokens } = useMyNftProfileTokens();
  const hasGk = useHasGk();
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [partialError, setPartialError] = useState(false);
  const [error, setError] = useState<Maybe<
  'ApprovalError' | 'ListingSignatureRejected' | 'ListingUnknownError' | 'ConnectionError'
  >>(null);

  const { data: looksrareProtocolFeeBps } = useSWR(
    'LooksrareProtocolFeeBps' + String(looksrareStrategy == null),
    async () => {
      return await looksrareStrategy.viewProtocolFee();
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    });

  const { data: NFTCOMProtocolFee } = useSWR(
    'NFTCOMProtocolFee' + currentAddress,
    async () => {
      return await marketplace.protocolFee();
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    });

  const { data: NFTCOMProfileFee } = useSWR(
    'NFTCOMProfileFee' + currentAddress,
    async () => {
      return await marketplace.profileFee();
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    });

  const getMaxMarketplaceFees: () => number = useCallback(() => {
    return getMaxMarketplaceFeesUSD(toList, looksrareProtocolFeeBps, getByContractAddress, myOwnedProfileTokens?.length ? NFTCOMProfileFee : Number(NFTCOMProtocolFee), hasGk);
  }, [toList, looksrareProtocolFeeBps, getByContractAddress, myOwnedProfileTokens?.length, NFTCOMProfileFee, NFTCOMProtocolFee, hasGk]);

  const getMaxRoyaltyFees: () => number = useCallback(() => {
    return getMaxRoyaltyFeesUSD(toList, looksrareProtocolFeeBps, getByContractAddress, toListNftComRoyaltyFees, x2y2Fees);
  }, [toList, looksrareProtocolFeeBps, getByContractAddress, toListNftComRoyaltyFees, x2y2Fees]);

  const getTotalListings = useCallback(() => {
    return toList?.reduce((total, stagedListing) => {
      return total + stagedListing?.targets.length ?? 0;
    }, 0);
  }, [toList]);

  const getTotalMinimumProfitUSD: () => number = useCallback(() => {
    const total = toList?.reduce((cartTotal, stagedListing) => {
      const targetValues = stagedListing?.targets.map((target) => {
        const currencyData = getByContractAddress(stagedListing.currency ?? target.currency);
        return currencyData?.usd(Number(ethers.utils.formatUnits(
          BigNumber.from(stagedListing.startingPrice ?? target.startingPrice ?? 0),
          currencyData?.decimals ?? 18
        ))) ?? 0;
      });
      return cartTotal + Math.min(...targetValues || []);
    }, 0);

    return total - getMaxMarketplaceFees() - getMaxRoyaltyFees();
  } , [getByContractAddress, getMaxMarketplaceFees, getMaxRoyaltyFees, toList]);

  const getNeedsApprovals = useCallback(() => {
    return toList?.some(stagedListing =>
      (stagedListing.targets.find(target => target.protocol === ExternalProtocol.LooksRare) != null &&
        (stagedListing?.nft?.type == NftType.Erc721 ?
          !stagedListing?.isApprovedForLooksrare :
          !stagedListing?.isApprovedForLooksrare1155)) ||
      (stagedListing.targets.find(target => target.protocol === ExternalProtocol.Seaport) != null && !stagedListing?.isApprovedForSeaport) ||
      (stagedListing.targets.find(target => target.protocol === ExternalProtocol.X2Y2) != null &&
        (stagedListing?.nft?.type == NftType.Erc721 ?
          !stagedListing?.isApprovedForX2Y2 :
          !stagedListing?.isApprovedForX2Y21155)) ||
      (stagedListing.targets.find(target => target.protocol === ExternalProtocol.NFTCOM) != null && !stagedListing?.isApprovedForNFTCOM)
    );
  }, [toList]);

  const getSummaryContent = useCallback(() => {
    if (success) {
      return <CheckoutSuccessView
        userAddress={currentAddress}
        onClose={() => {
          if (success) {
            if (!router.pathname.includes('/nft/')) router.push(`/app/nft/${toList?.[0]?.nft?.contract}/${toList?.[0]?.nft?.tokenId}`);
            clear();
            closeCartSidebar();
          }
          setSuccess(false);
          setShowProgressBar(false);
          setError(null);
          props.onClose();
        }}
        type={SuccessType.Listing}
        subtitle="You have successfully listed your items!"
      />;
    } else if (partialError){
      return <CheckoutSuccessView
        hasError
        onClose={() => {
          if (success) {
            if (!router.pathname.includes('/nft/')) router.push(`/app/nft/${toList?.[0]?.nft?.contract}/${toList?.[0]?.nft?.tokenId}`);
            clear();
            closeCartSidebar();
          }
          setSuccess(false);
          setShowProgressBar(false);
          setError(null);
          props.onClose();
        }}
        userAddress={currentAddress}
        type={SuccessType.Listing}
        subtitle="You have successfully listed your items!"
      />;
    }
    else if (showProgressBar) {
      return (
        <div className="">
          <VerticalProgressBar
            activeNodeIndex={
              error === 'ConnectionError' ?
                0 :
                getNeedsApprovals() || error === 'ApprovalError' ? 1 : success ? 3 : 2
            }
            nodes={[
              {
                label: 'Initialize Wallet',
                error: error === 'ConnectionError'
              },
              {
                label: 'Approve Collections for Sale',
                error: error === 'ApprovalError',
                items: filterDuplicates(
                  toList,
                  (first, second) => first.nft?.contract === second.nft?.contract
                )?.map((stagedListing) => {
                  return stagedListing.targets.map((target: ListingTarget) => {
                    const approved = target.protocol === ExternalProtocol.LooksRare ?
                      stagedListing?.nft?.type == NftType.Erc721 ?
                        stagedListing?.isApprovedForLooksrare :
                        stagedListing?.isApprovedForLooksrare1155 :
                      target.protocol === ExternalProtocol.X2Y2 ?
                        stagedListing?.nft?.type == NftType.Erc721 ?
                          stagedListing?.isApprovedForX2Y2 :
                          stagedListing?.isApprovedForX2Y21155 :
                        target.protocol === ExternalProtocol.NFTCOM
                          ? stagedListing?.isApprovedForNFTCOM :
                          stagedListing?.isApprovedForSeaport;
                    return {
                      label: 'Approve ' + (!isNullOrEmpty(stagedListing?.collectionName) ? stagedListing?.collectionName : 'Collection') + ' for ' + getProtocolDisplayName(target.protocol),
                      startIcon: target.protocol === ExternalProtocol.Seaport ?
                        <OpenseaIcon
                          className={'h-8 w-8 shrink-0 grow-0 aspect-square'}
                          alt="Opensea logo"
                          layout="fill"
                        /> :
                        target.protocol === ExternalProtocol.LooksRare ?
                          <LooksrareIcon
                            className={'h-8 w-8 shrink-0 grow-0 aspect-square'}
                            alt="Looksrare logo"
                            layout="fill"
                          /> :

                          target.protocol === ExternalProtocol.NFTCOM ?
                            <NFTLogo
                              className={'h-8 w-8 shrink-0 grow-0 aspect-square'}
                              alt="NFT.com logo"
                              layout="fill"
                            /> :
                            <X2Y2Icon
                              className={'h-8 w-8 shrink-0 grow-0 aspect-square'}
                              alt="Looksrare logo"
                              layout="fill"
                            />
                      ,
                      endIcon: approved ?
                        <CheckCircle size={16} className="text-green-500 ml-2" /> :
                        error === 'ApprovalError' ?
                          <X size={16} className="text-red-400 ml-2" /> :
                          <SpinnerGap size={16} className="text-yellow-500 animate-spin ml-2" />,
                    } as ProgressBarItem;
                  });
                }).flat()
              },
              {
                label: `Confirm ${getTotalListings()} Listings`,
                error: error === 'ListingSignatureRejected' || error === 'ListingUnknownError',
              }
            ]}
          />
        </div>
      );
    } else {
      // fee summary, default state.
      return (
        <>
          <p className="text-3xl font-noi-grotesk mx-4">
            Listing Fees
          </p>
          <p className='text-2xl text-[#6F6F6F] mx-4 font-bold'>
            {toList?.length ?? 0} NFT{toList?.length > 1 && 's'}
          </p>
          <div className="mx-4 my-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className='font-semibold'>Max Marketplace Fees</span>
              <span className='font-medium text-[#6F6F6F] text-sm'>
                Estimated Amount
              </span>
            </div>
            <div className="flex flex-col align-end">
              <span className='font-semibold'>{'$' + (getMaxMarketplaceFees()?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? 0) }</span>
            </div>
          </div>
          <div className="mx-4 my-4 flex items-center justify-between">
            <div className='flex flex-col'>
              <span className='font-semibold'>Max Royalties</span>
              <span className='font-medium text-[#6F6F6F] text-sm'>
                Estimated Amount
              </span>
            </div>
            <div className="flex flex-col justify-end">
              <span className="font-semibold">{'$' + (getMaxRoyaltyFees()?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? 0)}</span>
            </div>
          </div>
          <div className='px-8 border-t border-[#D5D5D5] w-full'/>
          <div className="mx-4 my-4 flex items-center justify-between">
            <div className='flex flex-col'>
              <span className='font-semibold'>Minimum Profit</span>
              <span className='font-medium text-[#6F6F6F] text-sm'>
              Estimated Value
              </span>
            </div>
            <div className='flex flex-col justify-end'>
              <span className='font-semibold'>{'$' + (getTotalMinimumProfitUSD()?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? 0)}</span>
            </div>
          </div>
        </>
      );
    }
  }, [clear, closeCartSidebar, currentAddress, error, getMaxMarketplaceFees, getMaxRoyaltyFees, getNeedsApprovals, getTotalListings, getTotalMinimumProfitUSD, partialError, props, router, showProgressBar, success, toList]);

  return (
    <Modal
      visible={props.visible}
      loading={false}
      title={''}
      onClose={() => {
        setSuccess(false);
        setShowProgressBar(false);
        setError(null);
        props.onClose();
      }}
      bgColor='white'
      hideX
      fullModal
      pure
    >
      <div className={`max-w-full overflow-hidden ${success || partialError ? myOwnedProfileTokens?.length == 0 ? 'minlg:max-w-[458px]' : partialError ? 'minlg:max-w-[873px]' : 'minlg:max-w-[700px]' : 'minlg:max-w-[458px] px-4 py-5'} h-screen minlg:h-max maxlg:h-max bg-white text-left rounded-none minlg:rounded-[20px] minlg:mt-24 minlg:m-auto`}>
        <div className={`font-noi-grotesk ${success || partialError ? myOwnedProfileTokens?.length == 0 ? 'lg:max-w-md max-w-lg' : 'lg:w-full' : 'pt-3 lg:max-w-md max-w-lg'} m-auto minlg:relative`}>
          <X onClick={() => {
            if (success || partialError) {
              clear();
              closeCartSidebar();
              router.push('/app/discover/nfts');
            }
            setSuccess(false);
            setShowProgressBar(false);
            setError(null);
            props.onClose();
          }} className='absolute top-3 z-50 right-3 hover:cursor-pointer closeButton' size={32} color="black" weight="fill" />
          {getSummaryContent()}
          {!success && !partialError && <div className="my-4 mt-8 flex">
            <Button
              size={ButtonSize.LARGE}
              stretch
              loading={showProgressBar && !error && !success && !partialError}
              disabled={!allListingsConfigured() || (showProgressBar && !error && !success && !partialError)}
              label={success || partialError ? 'Finish' : error ? 'Try Again' : 'Proceed to list'}
              onClick={async () => {
                try {
                  if (success || partialError) {
                    clear();
                    setSuccess(false);
                    setShowProgressBar(false);
                    return;
                  }

                  if (signer == null) {
                    setError('ConnectionError');
                    return;
                  }

                  setShowProgressBar(true);
                  setError(null);
                  setSuccess(false);

                  if (signer == null) {
                    setError('ConnectionError');
                    return;
                  }

                  if (getNeedsApprovals()) {
                    const uniqueCollections = filterDuplicates(
                      toList,
                      (first, second) => first.nft?.contract === second.nft?.contract
                    );
                    for (let i = 0; i < uniqueCollections.length; i++) {
                      const stagedListing = uniqueCollections[i];
                      for (let j = 0; j < uniqueCollections[i].targets.length; j++) {
                        const protocol = uniqueCollections[i].targets[j].protocol;
                        const approved = protocol === ExternalProtocol.LooksRare ?
                          stagedListing?.nft.type === NftType.Erc721 ?
                            stagedListing?.isApprovedForLooksrare :
                            stagedListing?.isApprovedForLooksrare1155 :
                          protocol === ExternalProtocol.X2Y2 ?
                            stagedListing?.nft?.type === NftType.Erc721 ?
                              stagedListing?.isApprovedForX2Y2 :
                              stagedListing?.isApprovedForX2Y21155 :
                            protocol === ExternalProtocol.NFTCOM
                              ? stagedListing?.isApprovedForNFTCOM :
                              stagedListing?.isApprovedForSeaport;

                        if (!approved && protocol === ExternalProtocol.LooksRare) {
                          const result = await approveCollection(stagedListing, ExternalProtocol.LooksRare)
                            .then(result => {
                              if (!result) {
                                setError('ApprovalError');
                                return false;
                              }
                              return true;
                            })
                            .catch(() => {
                              setError('ApprovalError');
                              return false;
                            });
                          stagedListing.isApprovedForLooksrare = result;
                          if (!result) {
                            return;
                          }
                        } else if (!approved && protocol === ExternalProtocol.Seaport) {
                          const result = await approveCollection(stagedListing, ExternalProtocol.Seaport)
                            .then(result => {
                              if (!result) {
                                setError('ApprovalError');
                                return false;
                              }
                              return true;
                            })
                            .catch(() => {
                              setError('ApprovalError');
                              return false;
                            });
                          stagedListing.isApprovedForSeaport = result;
                          if (!result) {
                            return;
                          }
                        } else if (!approved && protocol === ExternalProtocol.X2Y2) {
                          const result = await approveCollection(stagedListing, ExternalProtocol.X2Y2)
                            .then(result => {
                              if (!result) {
                                setError('ApprovalError');
                                return false;
                              }
                              return true;
                            })
                            .catch(() => {
                              setError('ApprovalError');
                              return false;
                            });
                          stagedListing.isApprovedForX2Y2 = result;
                          if (!result) {
                            return;
                          }
                        } else if (!approved && protocol === ExternalProtocol.NFTCOM) {
                          const result = await approveCollection(stagedListing, ExternalProtocol.NFTCOM)
                            .then(result => {
                              if (!result) {
                                setError('ApprovalError');
                                return false;
                              }
                              return true;
                            })
                            .catch(() => {
                              setError('ApprovalError');
                              return false;
                            });
                          stagedListing.isApprovedForNFTCOM = result;
                          if (!result) {
                            return;
                          }
                        }
                      }
                    }
                  }
                  const result: ListAllResult = await listAll(toList);
                  if (result === ListAllResult.Success) {
                    setSuccess(true);
                  } else if (result === ListAllResult.PartialError){
                    setPartialError(true);
                    setShowProgressBar(false);
                  } else {
                    setAllListingsFail(true);
                    setShowProgressBar(false);
                  }
                } catch (err) {
                  Sentry.captureException(err);
                }
              }
              }
              type={ButtonType.PRIMARY}
            />
          </div>}
          {
            !isNullOrEmpty(error) &&
            <div className='w-full mt-4'>
              <Button
                size={ButtonSize.LARGE}
                stretch
                label={'Cancel'}
                onClick={() => {
                  setSuccess(false);
                  setShowProgressBar(false);
                  setError(null);
                  props.onClose();
                }}
                type={ButtonType.SECONDARY}
              />
            </div>
          }
        </div>
      </div>
    </Modal>
  );
}
