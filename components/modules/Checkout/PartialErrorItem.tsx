import { NftType } from 'graphql/generated/types';
import { ExternalProtocol } from 'types';
import { filterDuplicates } from 'utils/format';
import { getProtocolDisplayName } from 'utils/marketplaceUtils';
import { tw } from 'utils/tw';

import { ListAllResult, ListingTarget, NFTListingsContext, StagedListing } from './NFTListingsContext';

import { WarningCircle } from 'phosphor-react';
import LooksrareIcon from 'public/icons/looksrare-icon.svg?svgr';
import NFTLogo from 'public/icons/nft_logo_yellow.svg?svgr';
import OpenseaIcon from 'public/icons/opensea-icon.svg?svgr';
import X2Y2Icon from 'public/icons/x2y2-icon.svg?svgr';
import { useCallback, useContext, useState } from 'react';
import { PartialObjectDeep } from 'type-fest/source/partial-deep';

export interface PartialErrorItemProps {
  listing: StagedListing;
  target: PartialObjectDeep<ListingTarget, unknown>
}

export function PartialErrorItem({ listing, target } : PartialErrorItemProps) {
  const {
    listAll,
    approveCollection,
    setHasListingError
  } = useContext(NFTListingsContext);
  const [resubmitting, setResubmitting] = useState(false);

  const getNeedsApprovals = useCallback(() => {
    return [listing]?.some(stagedListing =>
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
  }, [listing]);

  return (
    <>
      {target.listingError &&
        <div className='w-full border-t mt-[10px] pt-3 border-[#E6E6E6]'>
          <div className='flex'>
            <div className='relative mr-4 mt-1'>
              <WarningCircle weight="fill" color="#E43D20" className='absolute z-50 -top-2 -right-2' />
              {target.protocol === ExternalProtocol.Seaport && <OpenseaIcon
                className='h-6 w-6 relative shrink-0 hover:opacity-70 '
                alt="Opensea logo"
                layout="fill"
              />}
              {target.protocol === ExternalProtocol.LooksRare && <LooksrareIcon
                className='h-6 w-6 relative shrink-0 hover:opacity-70 '
                alt="Looksrare logo"
                layout="fill"
              />}
              {target.protocol === ExternalProtocol.NFTCOM && <NFTLogo
                className='h-5 w-5 relative shrink-0 hover:opacity-70 '
                alt="NFT.com logo"
                layout="fill"
              />}
              {target.protocol === ExternalProtocol.X2Y2 && <X2Y2Icon
                className='h-5 w-5 relative shrink-0 hover:opacity-70 '
                alt="X2Y2 logo"
                layout="fill"
              />}
            </div>
            <div className='w-3/4'>
              <p className='text-[#E43D20] text-sm font-medium leading-[17px]'>There was an error listing this NFT on {getProtocolDisplayName(target.protocol)}</p>
              <p
                className={tw(
                  'text-xs text-[#6A6A6A] mt-1 underline',
                  !resubmitting && 'hover:cursor-pointer'
                )}
                onClick={!resubmitting
                  ? async () => {
                    setResubmitting(true);
                    if (getNeedsApprovals()) {
                      const uniqueCollections = filterDuplicates(
                        [listing],
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
                                  setResubmitting(false);
                                  return false;
                                }
                                return true;
                              })
                              .catch(() => {
                                setResubmitting(false);
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
                                  setResubmitting(false);
                                  return false;
                                }
                                return true;
                              })
                              .catch(() => {
                                setResubmitting(false);
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
                                  setResubmitting(false);
                                  return false;
                                }
                                return true;
                              })
                              .catch(() => {
                                setResubmitting(false);
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
                                  setResubmitting(false);
                                  return false;
                                }
                                return true;
                              })
                              .catch(() => {
                                setResubmitting(false);
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
                    const result: ListAllResult = await listAll([listing], target.protocol);
                    if (result === ListAllResult.Success) {
                      setResubmitting(false);
                      setHasListingError(listing, false, target.protocol);
                    } else {
                      setResubmitting(false);
                    }
                  }
                  : null}
              >
                {resubmitting ? 'Resubmitting...': 'Please retry here'}
              </p>
            </div>
          </div>
        </div>
      }
    </>
  );
}
