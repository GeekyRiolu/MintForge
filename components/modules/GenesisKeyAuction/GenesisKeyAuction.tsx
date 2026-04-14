import { LoadedContainer } from 'components/elements/Loader/LoadedContainer';
import { NetworkErrorTile as StaticNetworkErrorTile } from 'components/elements/NetworkErrorTile';
import { useKeyBackground } from 'hooks/state/useKeyBackground';
import { useGenesisKeyPublicSaleData } from 'hooks/useGenesisKeyPublicSaleData';
import { useOwnedGenesisKeyTokens } from 'hooks/useOwnedGenesisKeyTokens';
import { useSupportedNetwork } from 'hooks/useSupportedNetwork';
import { useTotalGKPublicRemaining } from 'hooks/useTotalGKPublicRemaining';
import { isNullOrEmpty } from 'utils/format';
import { tw } from 'utils/tw';

import { GenesisKeyPublicSale } from './GenesisKeyPublicSale';
import { SignedOutView } from './SignedOutView';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useAccount } from 'wagmi';

export enum AuctionType {
  Blind = 'Blind',
  Public = 'Public'
}

const DynamicNetworkErrorTile = dynamic<React.ComponentProps<typeof StaticNetworkErrorTile>>(() => import('components/elements/NetworkErrorTile').then(mod => mod.NetworkErrorTile));

/**
 * the whole genesis key auction flow, with the following steps:
 * - wallet connection (if not connected)
 * - countdown (if auction not started yet)
 * - Bid input (initial and modify existing)
 * - post-auction UI (congrats if won, sorry if lost)
 */
export function GenesisKeyAuction() {
  const liveAuctionName = 'public';
  const { address: currentAddress } = useAccount();
  const { isSupported } = useSupportedNetwork();
  const { totalRemaining, loading: loadingTotalGKRemaining } = useTotalGKPublicRemaining();

  const keyBackground: { img, bg } = useKeyBackground();

  const {
    currentPrice,
    loading: loadingPublicAuctionData,
  } = useGenesisKeyPublicSaleData();

  const {
    data: ownedGenesisKeyTokens,
    loading: loadingOwnedGenesisKeys
  } = useOwnedGenesisKeyTokens(currentAddress);

  const [firstLoaded, setFirstLoaded] = useState(false);
  useEffect(() => {
    if (!firstLoaded) {
      if (!currentAddress) {
        setFirstLoaded(true);
      } else {
        setFirstLoaded(
          !loadingTotalGKRemaining &&
          totalRemaining != null &&
          !loadingPublicAuctionData &&
          !loadingOwnedGenesisKeys &&
          ownedGenesisKeyTokens != null
        );
      }
    }
  }, [
    ownedGenesisKeyTokens,
    liveAuctionName,
    isSupported,
    firstLoaded,
    loadingPublicAuctionData,
    loadingTotalGKRemaining,
    totalRemaining,
    loadingOwnedGenesisKeys,
    currentAddress
  ]);

  const [auctionEnded, setAuctionEnded] = useState(
    totalRemaining?.lte(0) ?? false
  );

  useEffect(() => {
    setAuctionEnded(totalRemaining?.lte(0) ?? false);
  }, [liveAuctionName, totalRemaining]);

  const getAuctionContent = useCallback(() => {
    if (!currentAddress) {
      return (
        <div className='w-full flex h-full flex-col items-center'>
          <SignedOutView auctionText />
        </div>);
    }
    if (!isSupported) {
      return null;
    }
    if (!auctionEnded && !currentAddress) {
      return <div className='w-full flex h-full flex-col items-center'>
        <SignedOutView auctionText />
      </div>;
    }
    if (!auctionEnded && currentAddress) {
      return (
        <div className='w-full flex flex-col h-full items-center'>
          <GenesisKeyPublicSale currentPrice={currentPrice} />
        </div>
      );
    }
    if (auctionEnded) {
      if (!currentAddress) {
        return <div className='w-full h-full flex flex-col items-center'>
          <SignedOutView auctionText ended />
        </div>;
      }
      return (
        <div className='w-full h-full flex flex-col items-center'>
          <div className={tw(
            'w-full items-center',
            'justify-center h-10 text-lg text-center',
            isMobile ? 'px-4' : '',
            'text-primary-txt dark:text-primary-txt-dk'
          )}
          >
            The {' '}
            {'Public Sale'}{' '}
            has <span className="font-bold">Ended</span>.
          </div>
          <GenesisKeyPublicSale currentPrice={currentPrice} />
        </div>
      );
    }
  }, [isSupported, auctionEnded, currentAddress, currentPrice]);

  return (
    <div className={tw(
      'w-screen h-screen bg-no-repeat bg-center bg-cover',
      'backdrop-blur-sm backdrop-opacity-80'
    )}
    style={{
      // eslint-disable-next-line max-len
      background: 'radial-gradient(59.6% 80.37% at 50.68% 83.52%, #272F46 0%, #202F56 46.87%, #030406 100%)'
    }}>
      <div className={tw(
        'absolute bottom-0 w-full h-full',
        'justify-center items-center',
        'bg-transparent',
        'bg-no-repeat bg-center bg-contain sm:bg-cover bg-blend-screen',
        'bg-clip-content',
        'backdrop-saturate-150',
      )}
      style={
        (isMobile && isNullOrEmpty(keyBackground.img)) ?
          { backgroundImage: `url(${keyBackground.img})` }
          : { backgroundImage: '' }
      }
      >
        {!isMobile &&
          <div
            className={tw(
              'absolute items-center w-full h-full justify-center drop-shadow-md',
              'overflow-auto z-20 flex justify-center',
              isNullOrEmpty(keyBackground.img)
                ? '' // fall through to splash key behind this component.
                // otherwise, fill in the background behind the minted key.
                : keyBackground.bg === 'white' ?
                  'bg-[#C0C0C0]'
                  : 'bg-black'
            )}
          >
            <video
              className="h-full"
              id='keyVideo'
              src={keyBackground.img}
              autoPlay
              muted
              loop
            />
          </div>
        }
        <div
          className={tw('w-full h-full absolute z-40')}
          // eslint-disable-next-line max-len
          style={{
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 63.02%, #000000 100%)'
          }}
        >
          <div
            className={tw(
              'flex flex-col w-full h-full items-center pt-20',
            )}>
            {currentAddress && !isSupported && <DynamicNetworkErrorTile />}
            <LoadedContainer loaded={firstLoaded} fitToParent>
              {getAuctionContent()}
            </LoadedContainer>
          </div>
        </div>
      </div>
    </div>);
}
