import { LoadedContainer } from 'components/elements/Loader/LoadedContainer';
import DefaultLayout from 'components/layouts/DefaultLayout';
import { AuctionType } from 'components/modules/GenesisKeyAuction/GenesisKeyAuction';
import { GenesisKeyLoserView } from 'components/modules/GenesisKeyAuction/GenesisKeyLoserView';
import { GenesisKeyWinnerView } from 'components/modules/GenesisKeyAuction/GenesisKeyWinnerView';
import { SignedOutView } from 'components/modules/GenesisKeyAuction/SignedOutView';
import { useGenesisKeyInsiderMerkleCheck } from 'hooks/merkle/useGenesisKeyInsiderMerkleCheck';
import { useKeyBackground } from 'hooks/state/useKeyBackground';
import { useInsiderGenesisKeyIDs } from 'hooks/useInsiderGenesisKeyIDs';
import { useOwnedGenesisKeyTokens } from 'hooks/useOwnedGenesisKeyTokens';
import { isNullOrEmpty } from 'utils/format';
import { tw } from 'utils/tw';

import { useCallback, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useAccount } from 'wagmi';

export default function ClaimGenesisKeyPage() {
  const [firstLoaded, setFirstLoaded] = useState(false);

  const { img: keyImg } = useKeyBackground();
  const { address: currentAddress } = useAccount();
  const insiderMerkleData = useGenesisKeyInsiderMerkleCheck(currentAddress);
  const {
    data: ownedGenesisKeyTokens,
    loading: loadingOwnedGenesisKeys
  } = useOwnedGenesisKeyTokens(currentAddress);
  const { data: insiderReservedIDs, loading: loadingInsiderReservedGKs } = useInsiderGenesisKeyIDs();

  useEffect(() => {
    if (!firstLoaded) {
      setFirstLoaded(
        !loadingOwnedGenesisKeys && ownedGenesisKeyTokens != null &&
        !loadingInsiderReservedGKs && insiderReservedIDs != null
      );
    }
  }, [firstLoaded, insiderReservedIDs, loadingInsiderReservedGKs, loadingOwnedGenesisKeys, ownedGenesisKeyTokens]);

  const shouldShowClaim = useCallback(() => {
    // only insiders should have access to GK claiming here now.
    // they should only be able to claim if they don't yet have a reserved GK.
    return insiderMerkleData != null;
  }, [insiderMerkleData]);

  const getContent = useCallback(() => {
    if (!currentAddress) {
      return (<SignedOutView />);
    }
    return (
      <>
        {
          shouldShowClaim()
            ? <GenesisKeyWinnerView
              liveAuction={AuctionType.Blind}
              ownedTokenID={null}
              claimData={null}
              insiderClaimData={insiderMerkleData}
            />
            : <GenesisKeyLoserView
              liveAuction={AuctionType.Blind}
            />
        }
      </>
    );
  }, [insiderMerkleData, shouldShowClaim, currentAddress]);

  return (
    <>
      {!isMobile &&
        <div
          className={tw(
            'absolute items-center w-full h-full justify-center drop-shadow-md',
            'overflow-auto z-20 flex justify-center',
            isNullOrEmpty(keyImg)
              ? '' // fall through to splash key behind this component.
              // otherwise, fill in the background behind the minted key.
              : 'bg-[#C0C0C0]'
          )}
        >
          <video
            className="h-full"
            id='keyVideo'
            src={keyImg}
            autoPlay
            muted
            loop
          />
        </div>
      }
      <div className={tw(
        'relative flex flex-col overflow-y-auto items-center mt-32',
        'overflow-x-hidden bg-white w-screen h-screen z-50',
      )}>
        <LoadedContainer loaded={firstLoaded}>
          {getContent()}
        </LoadedContainer>
      </div>
    </>
  );
}

ClaimGenesisKeyPage.getLayout = function getLayout(page) {
  return (
    <DefaultLayout>
      {page}
    </DefaultLayout>
  );
};
