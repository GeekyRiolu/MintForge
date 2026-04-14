/* eslint-disable @next/next/no-img-element */
import LikeCount from 'components/elements/LikeCount';
import LoggedInIdenticon from 'components/elements/LoggedInIdenticon';
import { RoundedCornerAmount, RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { NftMemo } from 'components/modules/Analytics/NftMemo';
import { getAddressForChain, nftProfile } from 'constants/contracts';
import { LikeableType, Nft, NftType, Profile } from 'graphql/generated/types';
import { useCollectionQuery } from 'graphql/hooks/useCollectionQuery';
import { useNftLikeQuery } from 'graphql/hooks/useNFTLikeQuery';
import { useRefreshNftMutation } from 'graphql/hooks/useNftRefreshMutation';
import { useProfileQuery } from 'graphql/hooks/useProfileQuery';
import { useRefreshNftOrdersMutation } from 'graphql/hooks/useRefreshNftOrdersMutation';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useNftProfileTokens } from 'hooks/useNftProfileTokens';
import { getContractMetadata } from 'utils/alchemyNFT';
import { isNullOrEmpty } from 'utils/format';
import { getEtherscanLink, isOfficialCollection,shortenAddress } from 'utils/helpers';
import { tw } from 'utils/tw';

import { NFTDetailContextProvider } from './NFTDetailContext';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowClockwise } from 'phosphor-react';
import GK from 'public/icons/Badge_Key.svg?svgr';
import MultipleOwners from 'public/icons/multiple_owners.svg?svgr';
import Owner from 'public/icons/owner.svg?svgr';
import { useCallback } from 'react';
import { isMobile } from 'react-device-detect';
import useSWR from 'swr';
import { PartialDeep } from 'type-fest';
import { useAccount } from 'wagmi';
export interface NFTDetailProps {
  nft: PartialDeep<Nft>;
  tokenId: string;
  onRefreshSuccess?: () => void;
}

export const NFTDetail = ({ nft, tokenId, onRefreshSuccess }: NFTDetailProps) => {
  const router = useRouter();

  const defaultChainId = useDefaultChainId();

  const { data: collection } = useCollectionQuery({ chainId: String(defaultChainId), contract: nft?.contract });
  const { data: collectionMetadata } = useSWR(
    () => nft?.contract ?
      ['ContractMetadata', nft?.contract]
      : null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async ([url, contract]) => {
      return await getContractMetadata(contract, defaultChainId);
    });

  const collectionName = collectionMetadata?.contractMetadata?.name || collectionMetadata?.contractMetadata?.openSea?.collectionName;

  const { profileData: nftProfileData } = useProfileQuery(nft?.contract === getAddressForChain(nftProfile, defaultChainId) ? nft?.metadata?.name : null);

  const { profileTokens } = useNftProfileTokens(nft?.owner ?? nft?.wallet?.address);
  const { profileTokens: creatorTokens } = useNftProfileTokens(collection?.collection?.deployer);
  const { address: currentAddress } = useAccount();

  const { data: nftLikeData, mutate: mutateNftLike } = useNftLikeQuery(nft?.contract, nft?.tokenId);

  const { profileData } = useProfileQuery(
    nft?.wallet?.preferredProfile == null ?
      profileTokens?.at(0)?.tokenUri?.raw?.split('/').pop() :
      null
  );

  const { profileData: collectionOwnerData } = useProfileQuery(
    creatorTokens?.at(0)?.tokenUri?.raw?.split('/').pop()
  );

  const { profileData: collectionPreferredOwnerData } = useProfileQuery(
    collectionOwnerData?.profile?.owner?.preferredProfile?.url
  );

  const profileOwnerToShow: PartialDeep<Profile> = nft?.wallet?.preferredProfile ?? profileData?.profile;
  const collectionOwnerToShow: PartialDeep<Profile> = collectionPreferredOwnerData?.profile ?? null;

  const { refreshNft, loading, success } = useRefreshNftMutation();
  const { refreshNftOrders } = useRefreshNftOrdersMutation();

  const refreshNftCallback = useCallback(() => {
    (async () => {
      const result = await refreshNft(nft?.id);
      await refreshNftOrders(nft?.id);
      if (result) {
        onRefreshSuccess && onRefreshSuccess();
      }
    })();
  }, [nft, onRefreshSuccess, refreshNft, refreshNftOrders]);

  return (
    <div className="flex flex-col w-full max-w-nftcom" id="NFTDetailContainer" key={nft?.id}>
      <div className={tw(
        'flex minmd:items-center w-full mt-8 py-4 px-4 justify-between',
      )}>
        <div className='flex flex-col whitespace-nowrap text-ellipsis overflow-hidden'>
          <Link href={`/app/collection/${isOfficialCollection(collection?.collection)}`}>
            <div className="text-[18px] font-medium font-noi-grotesk mb-2 tracking-wide text-[#6A6A6A] cursor-pointer">
              {isNullOrEmpty(collectionName) ?
                (<div role="status" className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 md:flex md:items-center">
                  <div className="w-full">
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-36 mb-4"></div>
                  </div>
                  <span className="sr-only">Loading...</span>
                </div>)
                : collectionName}
            </div>
          </Link>
          <div className='flex items-center'>
            {isNullOrEmpty(nft?.metadata?.name) && isNullOrEmpty(collectionMetadata?.contractMetadata?.name) ?
              (<div role="status" className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 md:flex md:items-center">
                <div className="w-full">
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-36 mb-4"></div>
                </div>
                <span className="sr-only">Loading...</span>
              </div>
              )
              : (
                <>
                  <div className='whitespace-nowrap text-ellipsis overflow-hidden font-noi-grotesk font-semibold text-[28px] leading-9 capitalize truncate'>
                    {nft?.metadata?.name ?? `${collectionMetadata?.contractMetadata?.name} #${tokenId}`}
                  </div>
                  {nftProfileData?.profile?.isGKMinted &&
                    <div className='h-5 w-5 minlg:h-6 minlg:w-6 ml-2'>
                      <GK />
                    </div>
                  }

                  <div className='ml-3'>
                    <LikeCount
                      mutate={mutateNftLike}
                      count={nftLikeData?.likeCount}
                      isLiked={nftLikeData?.isLikedBy}
                      likeData={{
                        id: nft?.id,
                        type: LikeableType.Nft
                      }}
                    />
                  </div>
                </>
              )
            }
          </div>
        </div>
        <div className='flex flex-col pl-4 minlg:pl-12'>
          {success ?
            <span className='font-noi-grotesk text-[#26AA73]'>Refreshed!</span> :
            <div
              id="refreshNftButton"
              onClick={refreshNftCallback}
              className={tw(
                'rounded-full bg-[#F6F6F6] h-8 w-8 flex items-center justify-center cursor-pointer',
                loading && !success ? 'animate-spin' : null,
              )}
            >
              <ArrowClockwise className='text-[#6F6F6F] h-5 w-5' />
            </div>
          }
        </div>
      </div>
      <div className='flex flex-row items-center w-full p-4'>
        <div className="grid grid-cols-2 md:gap-x-10 gap-x-32 gap-y-1">
          <span className='flex flex-col font-noi-grotesk text-[16px] not-italic font-medium mb-3 leading-5 text-[#6A6A6A]'>
            Creator
          </span>
          <span className='flex flex-col font-noi-grotesk text-[16px] not-italic font-medium mb-3 leading-5 text-[#6A6A6A]'>
            Owner
          </span>

          <div className='flex items-center'>
            <div className='flex flex-col w-[42px] h-[42px] aspect-square'>
              {collectionOwnerToShow?.photoURL ?
                <RoundedCornerMedia
                  containerClasses='shadow-xl border-2 border-white aspect-square'
                  variant={RoundedCornerVariant.Full}
                  amount={RoundedCornerAmount.Medium}
                  src={collectionOwnerToShow?.photoURL}
                />
                :
                <div className='rounded-full overflow-hidden shadow-xl border-2 border-white'>
                  <LoggedInIdenticon customSize={36} customString={collection?.collection?.contract} round border />
                </div>
              }
            </div>

            <div className=''>
              <div className='flex flex-col h-full'>
                {
                  creatorTokens?.length > 0 ?
                    <div
                      className={tw(
                        'flex px-3 items-center',
                        collectionOwnerToShow?.url != null && 'cursor-pointer'
                      )}
                      onClick={() => {
                        if (collectionOwnerToShow?.url == null) {
                          return;
                        }
                        router.push('/' + collectionOwnerToShow?.url);
                      }}
                    >
                      <span className={tw('text-base font-noi-grotesk font-medium leading-5',
                        'text-black'
                      )}>
                        {collectionOwnerToShow?.url == null ?
                          shortenAddress(collectionOwnerToShow?.owner?.address, 2) :
                          collectionOwnerToShow?.url
                        }
                      </span>
                    </div> :
                    <Link href={getEtherscanLink(Number(defaultChainId), collection?.collection?.contract, 'address')}>
                      <span className="cursor-pointer text-base hover:underline font-medium leading-5 font-noi-grotesk pl-3 pt-1">
                        {shortenAddress(collection?.collection?.contract, isMobile ? 4 : 6) ?? 'Unknown'}
                      </span>
                    </Link>
                }
              </div>
            </div>
          </div>

          <div className='flex items-center'>
            {isNullOrEmpty(nft?.owner) && isNullOrEmpty(nft?.wallet?.address) ?
              nft?.type === NftType.Erc1155 ?
                <div className='w-9 h-9 rounded-full'>
                  <MultipleOwners className='rounded-full shadow-lg' />
                </div>
                :
                <div className='w-9 h-9 rounded-full'>
                  <Owner className='rounded-full shadow-lg' />
                </div>
              :
              profileOwnerToShow?.photoURL ?
                <RoundedCornerMedia
                  containerClasses='w-[42px] shadow-xl border-2 border-white h-[42px] aspect-square'
                  variant={RoundedCornerVariant.Full}
                  amount={RoundedCornerAmount.Medium}
                  src={profileOwnerToShow?.photoURL}
                />
                :
                <div className='rounded-full overflow-hidden shadow-xl border-2 border-white'>
                  <LoggedInIdenticon customSize={36} round border />
                </div>
            }

            <div className='overflow-hidden'>
              <div className='flex flex-col h-full'>
                {
                  profileTokens?.length > 0 ?
                    <div
                      className={tw(
                        'flex px-3 items-center',
                        profileOwnerToShow?.url != null && 'cursor-pointer'
                      )}
                      onClick={() => {
                        if (profileOwnerToShow?.url == null) {
                          return;
                        }
                        router.push('/' + profileOwnerToShow?.url);
                      }}
                    >
                      <span className="text-ellipsis overflow-hidden text-base font-medium leading-5 font-noi-grotesk text-link">
                        {!profileOwnerToShow?.url == null ?
                          shortenAddress(nft?.owner ?? nft?.wallet?.address, 0) :
                          profileOwnerToShow?.url
                        }
                      </span>
                    </div> :
                    <Link href={getEtherscanLink(Number(defaultChainId), nft?.owner ?? nft?.wallet?.address, 'address')}>
                      <span className="text-[#1F2127] text-base cursor-pointer hover:underline font-medium leading-5 font-noi-grotesk pl-3">
                        {!isNullOrEmpty(nft?.owner) || !isNullOrEmpty(nft?.wallet?.address) ?
                          shortenAddress(nft?.owner ?? nft?.wallet?.address, isMobile ? 4 : 6) ?? 'Unknown' :
                          <div className='bg-[#E6E6E6] h-3 w-20 rounded-full animate-pulse'>
                          </div>
                        }
                      </span>
                    </Link>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        (
          (currentAddress === nft?.wallet?.address && !isNullOrEmpty(currentAddress)) ||
          (currentAddress !== nft?.wallet?.address && !isNullOrEmpty(nft?.wallet?.address) && !isNullOrEmpty(nft?.memo)))
        &&
        <div className="flex minxl:basis-1/2">
          <NFTDetailContextProvider nft={nft} >
            <NftMemo nft={nft} />
          </NFTDetailContextProvider>
        </div>
      }
    </div>
  );
};
