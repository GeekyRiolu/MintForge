import 'rc-slider/assets/index.css';

import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import LoggedInIdenticon from 'components/elements/LoggedInIdenticon';
import { RoundedCornerAmount, RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { Switch } from 'components/elements/Switch';
import { NFTListingsContext } from 'components/modules/Checkout/NFTListingsContext';
import { Profile } from 'graphql/generated/types';
import { useProfileQuery } from 'graphql/hooks/useProfileQuery';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useHasGk } from 'hooks/useHasGk';
import { useMyNftProfileTokens } from 'hooks/useMyNftProfileTokens';
import { useNftProfileTokens } from 'hooks/useNftProfileTokens';
import { ExternalProtocol } from 'types';
import { Doppler, getEnvBool } from 'utils/env';
import { filterNulls, isNullOrEmpty } from 'utils/format';
import { getEtherscanLink, shortenAddress } from 'utils/helpers';
import { tw } from 'utils/tw';

import { ListingCheckoutNftTableRow } from './ListingCheckoutNftTableRow';
import { NFTListingsCartSummaryModal } from './NFTListingsCartSummaryModal';
import { handleRender } from './TooltipSlider';

import router from 'next/router';
import { ArrowLeft } from 'phosphor-react';
import LooksrareGray from 'public/icons/looksrare_gray.svg?svgr';
import LooksrareIcon from 'public/icons/looksrare-icon.svg?svgr';
import NFTLogo from 'public/icons/nft_logo_yellow.svg?svgr';
import NoActivityIcon from 'public/icons/no_activity.svg?svgr';
import OpenSeaGray from 'public/icons/opensea_gray.svg?svgr';
import OpenseaIcon from 'public/icons/opensea-icon.svg?svgr';
import ErrorIcon from 'public/icons/red-error-icon.svg?svgr';
import X2Y2Gray from 'public/icons/x2y2-gray.svg?svgr';
import X2Y2Icon from 'public/icons/x2y2-icon.svg?svgr';
import Slider from 'rc-slider';
import { useCallback, useContext, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import useSWR from 'swr';
import { PartialDeep } from 'type-fest';
import { useAccount } from 'wagmi';

export function ListingCheckout() {
  const {
    toList,
    setDuration,
    noExpirationNFTCOM,
    setNoExpirationNFTCOM,
    toggleTargetMarketplace,
    prepareListings,
    allListingsConfigured,
    decreasingPriceError,
    englishAuctionError,
    allListingsFail,
    setAllListingsFail,
  } = useContext(NFTListingsContext);
  const { address: currentAddress } = useAccount();
  const { marketplace } = useAllContracts();
  const { profileTokens: myOwnedProfileTokens } = useMyNftProfileTokens();
  const hasGk = useHasGk();

  const defaultChainId = useDefaultChainId();
  const { profileTokens } = useNftProfileTokens(toList[0]?.nft?.wallet?.address ?? toList[0]?.nft?.owner);
  const { profileData } = useProfileQuery(
    toList[0]?.nft?.wallet?.preferredProfile == null ?
      profileTokens[0]?.tokenUri?.raw?.split('/').pop() :
      null
  );

  useEffect(() => {
    toList.forEach(stagedNft => {
      if (!stagedNft.duration) {
        setDuration(30);
      }
    });
  }, [setDuration, toList]);

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

  const { data: NFTCOMGKFee } = useSWR(
    'NFTCOMGKFee' + currentAddress,
    async () => {
      return await marketplace.gkFee();
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    });

  const profileOwnerToShow: PartialDeep<Profile> = toList[0]?.nft?.wallet?.preferredProfile ?? profileData?.profile;
  const [showSummary, setShowSummary] = useState(false);

  const openseaAtLeastOneEnabled = !isNullOrEmpty(toList) && toList.find(nft => {
    return nft?.targets?.find(target => target?.protocol === ExternalProtocol.Seaport) != null;
  }) != null;
  const looksrareAtLeastOneEnabled = !isNullOrEmpty(toList) && toList.find(nft => {
    return nft?.targets?.find(target => target?.protocol === ExternalProtocol.LooksRare) != null;
  }) != null;
  const X2Y2AtLeastOneEnabled = !isNullOrEmpty(toList) && toList.find(nft => {
    return nft?.targets?.find(target => target?.protocol === ExternalProtocol.X2Y2) != null;
  }) != null;
  const NFTCOMAtLeastOneEnabled = !isNullOrEmpty(toList) && toList.find(nft => {
    return nft?.targets?.find(target => target?.protocol === ExternalProtocol.NFTCOM) != null;
  }) != null;

  const ListingOneNFT = useCallback(() => {
    return (
      <div className='hidden minlg:flex flex-col justify-start items-center bg-gray-200 w-2/5 min-h-[100vh]'>
        <div className='w-full ml-44 mt-20'>
          <h1
            className='text-2xl font-semibold font-noi-grotesk cursor-pointer flex items-center'
            onClick={() => {
              router.back();
            }}
          >
            <ArrowLeft size={24} color="black" className='ListingPageBackButton mr-3' />
            Back
          </h1>
        </div>
        {toList[0]?.nft?.metadata?.imageURL ?
          <div className='mt-20 w-1/2'>
            <div className="flex w-full max-h-[600px] max-w-nftcom object-contain drop-shadow-lg aspect-square">
              <RoundedCornerMedia
                key={toList[0]?.nft?.id}
                src={toList[0]?.nft?.metadata?.imageURL}
                videoOverride={true}
                variant={RoundedCornerVariant.None}
                objectFit='contain'
                containerClasses='overflow-hidden rounded-[16px]'
              />
            </div>
            <div className='flex font-noi-grotesk mt-10 mx-4'>
              <div className='flex flex-col justify-between w-3/5'>
                <span className='font-semibold text-ellipsis overflow-hidden'>{toList[0]?.nft?.metadata?.name}</span>
                <span className='text-[#6F6F6F] whitespace-nowrap text-ellipsis overflow-hidden'>{toList[0]?.collectionName || '-'}</span>
              </div>
              <div className='flex justify-start h-full w-2/5'>
                <div className='flex flex-col w-[42px] h-[42px] aspect-square'>
                  {profileOwnerToShow?.photoURL ?
                    <RoundedCornerMedia
                      containerClasses='shadow-xl border-2 border-white aspect-square'
                      variant={RoundedCornerVariant.Full}
                      amount={RoundedCornerAmount.Medium}
                      src={profileOwnerToShow?.photoURL}
                    />
                    :
                    <div className='rounded-full overflow-hidden shadow-xl border-2 border-white'>
                      <LoggedInIdenticon customSize={36} round border />
                    </div>
                  }
                </div>
                <div
                  className={tw(
                    'flex px-3 items-center',
                    'cursor-pointer hover:underline'
                  )}
                  onClick={() => {
                    if (profileOwnerToShow?.url) {
                      router.push('/' + profileOwnerToShow?.url);
                    } else {
                      window.open(getEtherscanLink(Number(defaultChainId), toList[0]?.nft?.wallet?.address ?? toList[0]?.nft?.owner, 'address'), '_blank');
                    }
                  }}
                >
                  <span className="text-base whitespace-nowrap text-ellipsis overflow-hidden font-medium leading-5 font-noi-grotesk">
                    {profileOwnerToShow?.url ?
                      profileOwnerToShow?.url :
                      shortenAddress(toList[0]?.nft?.wallet?.address ?? toList[0]?.nft?.owner, isMobile ? 4 : 6) ?? 'Unknown'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          :
          <div className='mt-[30vh] w-1/2 flex flex-col justify-center items-center'>
            <div role="status">
              <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#FDCC00]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
            <span className='text-[#6F6F6F] mt-4'>Loading NFT...</span>
          </div>
        }
      </div>
    );
  }, [defaultChainId, profileOwnerToShow?.photoURL, profileOwnerToShow?.url, toList]);

  const ListingCheckoutInfo = useCallback(() => {
    return <div className="flex flex-col items-center minlg:mx-auto minmd:w-full mt-10">
      <div className="flex flex-col items-center w-full">
        <div className={tw(
          'mb-16',
          'w-full flex flex-col items-center')}>
          <span className='text-lg w-full font-semibold flex text-[#A6A6A6]'>Select Marketplace(s)</span>
          <div className='flex flex-wrap minlg:flex-nowrap justify-between minlg:flex-row items-start w-full mt-2'>
            <div className='max-h-[93px] w-[49%] minlg:w-1/4 minlg:mr-2 flex flex-col items-center'>
              <div
                onClick={() => {
                  toggleTargetMarketplace(ExternalProtocol.NFTCOM);
                  setShowSummary(false);
                }}
                className={tw(
                  'max-h-[93px] w-full',
                  'border-[#D5D5D5] rounded-xl text-lg',
                  'px-4 py-3 cursor-pointer mt-2 flex flex-col items-center',
                  NFTCOMAtLeastOneEnabled ? 'border-2 border-primary-yellow font-bold bg-[#FFF0CB]' : 'border-2'
                )}
              >
                {NFTCOMAtLeastOneEnabled
                  ? <NFTLogo
                    className='h-[26px] relative shrink-0 -my-[4px] mb-[3px]'
                    alt="NFT.com logo"
                    layout="fill"
                  />
                  : <NFTLogo className='h-[26px] relative shrink-0 -my-[4px] mb-[3px]' />}
                <span className='font-semibold text-base'>NFT.com</span>
                <span className='ml-2 font-medium text-sm text-[#6F6F6F]'>({hasGk ? Number(NFTCOMGKFee) / 100 : myOwnedProfileTokens?.length ? Number(NFTCOMProfileFee) / 100 : Number(NFTCOMProtocolFee) / 100}% fee)</span>
              </div>
              <div className='text-[0.75rem] text-center py-1'><span className='text-primary-yellow'>{NFTCOMGKFee / 100}%</span> fee with GK</div>
              <div className='border-b w-4/5'></div>
              <div className='text-[0.75rem] text-center py-1'><span className='text-primary-yellow'>{NFTCOMProfileFee / 100}%</span> fee with profile</div>
              <div className='border-b w-4/5'></div>
              <span className='text-[0.75rem] text-center py-1'>{Number(NFTCOMProtocolFee) / 100}% fee without profile</span>
            </div>
            <div
              onClick={() => {
                toggleTargetMarketplace(ExternalProtocol.Seaport);
                setShowSummary(false);
              }}
              className={tw(
                'max-h-[93px] w-[49%] minlg:w-1/4',
                'border-[#D5D5D5] rounded-xl text-lg',
                'px-4 py-3 cursor-pointer mt-2 minlg:mr-2 flex flex-col items-center',
                openseaAtLeastOneEnabled ? 'border-2 border-primary-yellow font-bold' : 'border-2'
              )}
            >
              {openseaAtLeastOneEnabled
                ? <OpenseaIcon
                  className='h-[1.95rem] relative shrink-0 -my-[4px] -mb-[3px]'
                  alt="Opensea logo"
                  layout="fill"
                />
                : <OpenSeaGray className='relative shrink-0 -mt-[1px]' />}
              <span className='font-semibold text-base'>Opensea</span>
              <span className='ml-2 font-medium text-sm text-[#6F6F6F]'>(2.5% fee)</span>
            </div>
            <div
              onClick={() => {
                toggleTargetMarketplace(ExternalProtocol.LooksRare);
                setShowSummary(false);
              }}
              className={tw(
                'mt-[100px] max-h-[93px] w-[49%] minlg:w-1/4',
                'border-[#D5D5D5] rounded-xl text-lg',
                'px-4 py-3 cursor-pointer minlg:mt-2 minlg:mr-2 flex flex-col items-center',
                looksrareAtLeastOneEnabled ? 'border-2 border-primary-yellow font-bold' : 'border-2'
              )}
            >
              {looksrareAtLeastOneEnabled
                ? <LooksrareIcon
                  className='h-[1.97rem] relative shrink-0 -my-[4px] -mb-[3px]'
                  alt="Looksrare logo"
                  layout="fill"
                />
                :
                <LooksrareGray className='h-[1.8rem] relative shrink-0 -mb-[4px]' />}
              <span className='font-semibold text-base'>Looksrare</span>
              <span className='ml-2 font-medium text-sm text-[#6F6F6F]'>(2% fee)</span>
            </div>
            <div
              onClick={() => {
                toggleTargetMarketplace(ExternalProtocol.X2Y2);
                setShowSummary(false);
              }}
              className={tw(
                'mt-[100px] max-h-[93px] w-[49%] minlg:w-1/4',
                'border-[#D5D5D5] rounded-xl text-lg',
                'px-4 pt-3 py-3 cursor-pointer minlg:mt-2 flex flex-col items-center',
                X2Y2AtLeastOneEnabled ? 'border-2 border-primary-yellow font-bold' : 'border-2'
              )}
            >
              {X2Y2AtLeastOneEnabled
                ? <X2Y2Icon className='h-[1.5rem] relative shrink-0 mb-[2px]' /> :
                <X2Y2Gray className='h-[1.5rem] relative shrink-0 mb-[2px]' />}
              <span className='font-semibold text-base'>X2Y2</span>
              <span className='ml-2 font-medium text-sm text-[#6F6F6F]'>(0.5% fee)</span>
            </div>
          </div>
        </div>
        <div className='w-full flex flex-col mt-8 items-center'>
          <div className='w-full flex justify-between'>
            <span className={tw(
              NFTCOMAtLeastOneEnabled && getEnvBool(Doppler.NEXT_PUBLIC_NFTCOM_NO_EXPIRATION_LISTING_ENABLED) ? '' : 'w-full',
              'text-lg flex font-semibold')}>Set Duration</span>
            {NFTCOMAtLeastOneEnabled && getEnvBool(Doppler.NEXT_PUBLIC_NFTCOM_NO_EXPIRATION_LISTING_ENABLED) ?
              <div className='flex'>
                <Switch
                  left=""
                  right="No Expiration on "
                  enabled={noExpirationNFTCOM}
                  setEnabled={() => {
                    setNoExpirationNFTCOM(!noExpirationNFTCOM);
                  }}
                />
                <NFTLogo className='h-[26px] relative shrink-0 -my-[4px] -mb-[3px] ml-2' />
              </div>
              : null}
          </div>
          <div className='mt-8 w-[93%] minlg:w-full'>
            <Slider
              trackStyle={[{ backgroundColor: '#F9D54C' }]}
              handleStyle={[{ backgroundColor: 'black', border: 'none', width: '15px', height: '15px' }, { backgroundColor: 'black', border: 'none', width: '15px', height: '15px' }]}
              marks={{ 1: '1 Day', 30: '|', 60: '|', 90: '|', 120: '|', 150: '|', 180: '180 Days' }}
              min={1}
              max={180}
              defaultValue={30}
              handleRender={handleRender}
              onChange={(value) => setDuration(value as number)}
            />
          </div>
        </div>
        <div className='flex flex-col items-start w-full mb-10'>
          <span className='text-2xl w-full flex font-bold mt-20 minlg:mt-10 mb-8'>Your Listings</span>
          <div className="text-sm w-full">
            {filterNulls(toList).map((listing, index) => {
              return (
                <ListingCheckoutNftTableRow key={index} listing={listing} onPriceChange={() => {
                  setShowSummary(false);
                }} />
              );
            })}
          </div>
        </div>
        {
          (isNullOrEmpty(toList) || toList.length === 0) && <div className='flex flex-col items-center justify-center mb-12'>
            <NoActivityIcon className='h-[300px]' />
            <span className='text-lg font-medium font-noi-grotesk mb-2 flex items-center justify-center mt-5 text-[#4D4D4D]'>You haven’t added any listings yet</span>
          </div>
        }
        {(!showSummary || allListingsFail) && toList.length > 0 && <div className='w-full pb-8 mt-[10%]'>
          <Button
            size={ButtonSize.LARGE}
            label={'Start Listing'}
            disabled={!allListingsConfigured()}
            onClick={async () => {
              await prepareListings();
              if (allListingsFail) {
                setAllListingsFail(false);
              }
              setShowSummary(true);
            }}
            type={ButtonType.PRIMARY}
            stretch
          /></div>}
      </div>
      {showSummary && toList.length > 0 && <NFTListingsCartSummaryModal visible={showSummary && toList.length > 0 && !allListingsFail} onClose={() => setShowSummary(false)} />}
    </div>;
  }, [NFTCOMAtLeastOneEnabled, NFTCOMGKFee, NFTCOMProfileFee, NFTCOMProtocolFee, X2Y2AtLeastOneEnabled, allListingsConfigured, allListingsFail, hasGk, looksrareAtLeastOneEnabled, myOwnedProfileTokens?.length, noExpirationNFTCOM, openseaAtLeastOneEnabled, prepareListings, setAllListingsFail, setDuration, setNoExpirationNFTCOM, showSummary, toList, toggleTargetMarketplace]);

  return (
    <div className='flex w-full justify-between h-full'>
      {toList.length === 1 && ListingOneNFT()}
      {(toList.length === 0 || toList.length > 1) && <div className='hidden minlg:block w-1/5 mt-20'>
        <h1
          className='text-xl font-semibold font-noi-grotesk cursor-pointer ml-28'
          onClick={() => {
            router.back();
          }}>
          Back
        </h1>
      </div>}
      <div className={tw(
        toList.length === 1 ? 'minlg:px-[5%]' : 'minlg:px-2 minxl:px-4',
        'w-full flex flex-col justify-start items-center minlg:w-3/5 minxxl:px-28')}>
        <div className='w-full minlg:mt-20 flex minlg:block justify-start items-end minlg:items-center minlg:mx-auto'>
          <span
            className='minlg:hidden text-lg font-semibold font-noi-grotesk cursor-pointer minlg:ml-28'
            onClick={() => {
              router.back();
            }}>
            Back
          </span>
          <h1 className='text-2xl minlg:text-3xl pl-12 minlg:pl-0 font-semibold font-noi-grotesk'>Create Listings</h1>
        </div>
        {ListingCheckoutInfo()}
        {NFTCOMAtLeastOneEnabled && decreasingPriceError ?
          <div className='px-2 min-h-[3rem] border border-[#E43D20] max-h-[5rem] w-full -mt-4 bg-[#FFF8F7] text-[#E43D20] flex items-center font-medium font-noi-grotesk rounded mb-4'>
            <ErrorIcon className='relative shrink-0 mr-2' />
            Start Price should be higher than End Price
          </div>
          : null}
        {NFTCOMAtLeastOneEnabled && englishAuctionError ?
          <div className='px-2 min-h-[3rem] border border-[#E43D20] max-h-[5rem] w-full -mt-4 bg-[#FFF8F7] text-[#E43D20] flex items-center font-medium font-noi-grotesk rounded mb-4'>
            <ErrorIcon className='relative shrink-0 mr-2' />
            Reserve Price Price should be higher than Buy Now Price
          </div>
          : null}
        {allListingsFail &&
          <div className='px-2 py-2.5 min-h-[3rem] border border-[#E43D20] max-h-[5rem] w-full -mt-4 bg-[#FFF8F7] text-[#E43D20] flex items-center font-medium font-noi-grotesk rounded mb-4'>
            <ErrorIcon className='relative shrink-0 mr-2' />
            <div className='flex flex-col'>
              <p>There was an error while creating your listing{toList.length > 1 && 's'}.</p>
              <p
                onClick={async () => {
                  await prepareListings();
                  setAllListingsFail(false);
                  setShowSummary(true);
                }}
                className='underline hover:cursor-pointer w-max'
              >
                Please try again
              </p>
            </div>
          </div>
        }
      </div>
      {(toList.length === 0 || toList.length > 1) && <div className='hidden minlg:block w-1/5 mt-20'></div>}
    </div>
  );
}
