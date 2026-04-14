import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { LoadedContainer } from 'components/elements/Loader/LoadedContainer';
import { KeyClaimVideo } from 'components/modules/GenesisKeyAuction/KeyClaimVideo';
import { HeroTitle } from 'components/modules/Hero/HeroTitle';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { MerkleResult } from 'hooks/merkle/useGenesisKeyInsiderMerkleCheck';
import { useKeyBackground } from 'hooks/state/useKeyBackground';
import { useKeyVideo } from 'hooks/state/useKeyVideo';
import { useGenesisKeyMetadata } from 'hooks/useGenesisKeyMetadata';
import { useOwnedGenesisKeyTokens } from 'hooks/useOwnedGenesisKeyTokens';
import { processIPFSURL } from 'utils/ipfs';
import { tw } from 'utils/tw';

import { AuctionType } from './GenesisKeyAuction';
import { GenesisKeyPostClaimView } from './GenesisKeyPostClaimView';

import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useAccount, useSigner } from 'wagmi';

export interface GenesisKeyWinnerViewProps {
  /**
   * TODO: support displaying multiple GKs in this component.
   */
  ownedTokenID: number;
  /**
   * This should be non-null if we want the user to claim a GK in this component.
   */
  claimData: null;
  /**
   * This should be non-null if we want the insider to claim a GK in this component.
   * This uses a different claiming function.
   */
  insiderClaimData: MerkleResult | null;
  liveAuction: AuctionType;
  onBack?: () => void
}

export function GenesisKeyWinnerView(props: GenesisKeyWinnerViewProps) {
  const { genesisKeyTeamDistributor } = useAllContracts();
  const { address: currentAddress } = useAccount();
  const { data: signer } = useSigner();
  const { keyVideoVisible: showVideo, useKeyVideoToggle: playKeyVideo } = useKeyVideo();
  const { setKeyBackground } = useKeyBackground();
  const genesisKeyMetadata = useGenesisKeyMetadata(
    props.ownedTokenID != null ? BigNumber.from(props.ownedTokenID) : null);

  const genesisKeyImage = processIPFSURL(isMobile
    ? genesisKeyMetadata?.metadata?.image
    : genesisKeyMetadata?.metadata?.animation_url);

  const { mutate: mutateOwnedGKs } = useOwnedGenesisKeyTokens(currentAddress);

  const [showPostClaimView, setShowPostClaimView] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mintSucceeded, setMintSucceeded] = useState(props.ownedTokenID != null);
  const [fadeInPostClaimContent, setFadeInPostClaimContent] = useState(false);

  useEffect(() => {
    setMintSucceeded(props.ownedTokenID != null);
  }, [props.ownedTokenID]);

  useEffect(() => {
    if (genesisKeyImage && genesisKeyMetadata) {
      const bgColorAttribute = genesisKeyMetadata?.metadata?.attributes
        ?.find(attr => attr?.trait_type === 'Background');
      setKeyBackground(
        genesisKeyImage,
        bgColorAttribute?.value === 'Dark' ? 'black' : 'white'
      );
    }
  }, [genesisKeyImage, genesisKeyMetadata, setKeyBackground, props.ownedTokenID]);

  useEffect(() => {
    if (mintSucceeded && !showVideo) {
      setTimeout(() => {
        setFadeInPostClaimContent(true);
      }, 3000);
    }
  }, [showVideo, mintSucceeded]);

  const getMintSuccessView = useCallback(() => {
    return (
      <div className={tw('flex flex-col items-center')}>
        <HeroTitle color="white" items={['CONGRATULATIONS!']} />
        <div className={tw('flex flex-col rounded-xl deprecated_sm:border-none',
          'px-10 drop-shadow w-[600px] deprecated_sm:w-full',
          'bg-always-black bg-opacity-60 mt-8',
          'items-center justify-center')}
        >
          <span
            className="text-2xl text-primary-txt-dk py-4 text-center">
            {props.ownedTokenID != null ?
              'You own Genesis Key #' + props.ownedTokenID :
              'You won a Genesis Key!'
            }
          </span>
          {(mintSucceeded || props.ownedTokenID != null) &&
            <div className='flex items-center justify-center w-full my-3'>
              <div className={tw('shadow-md hover:shadow-lg focus:shadow-lg',
                'w-full font-bold tracking-wider space-y-5')}>
                <Button
                  size={ButtonSize.LARGE}
                  stretch
                  onClick={() => {
                    // todo: include a link to the metadata api for rendering card previews.
                    window.open(
                      'https://twitter.com/intent/tweet?' +
                      // 'url=' + encodeURIComponent(window.location.href) + props.id +
                      // 'url=' + encodeURIComponent('https://staging-api.nft.com/gk/') + props.id +
                      // '&'+
                      'text=' +
                      encodeURIComponent(
                        'I just claimed a genesis key from NFT.com! Check it out: ' +
                        'https://' + window.location.host + '/app/gallery/' + props.ownedTokenID
                      ),
                      '_blank'
                    );
                  }}
                  label="TWEET YOUR KEY"
                  type={ButtonType.PRIMARY}
                />
                <div
                  className={tw(
                    'text-base deprecated_sm:text-xs font-semibold',
                    'flex flex-row items-center mt-5 hover:underline cursor-pointer',
                    'text-action-primary cursor-pointer w-full justify-center flex'
                  )}
                  onClick={() => {
                    setKeyBackground(
                      '',
                      'black'
                    );
                    setShowPostClaimView(true);
                  }}
                >
                  Continue
                </div>
              </div>
            </div>
          }
        </div>
      </div>);
  }, [mintSucceeded, props.ownedTokenID, setKeyBackground]);

  return (
    <>
      <div className='flex flex-col'>
        <div
          className={tw('flex items-center',
            'z-20 mt-20 mb-10 dark deprecated_sm:px-4'
          )}
        >
          <KeyClaimVideo />
          {
            showPostClaimView ?
              <GenesisKeyPostClaimView
                onBack={() => {
                  setShowPostClaimView(false);
                  props.onBack && props.onBack();
                }}
              />
              :
              <div className="flex flex-col w-full items-center">
                <>
                  {
                    mintSucceeded || props.ownedTokenID != null ?
                      <LoadedContainer loaded={fadeInPostClaimContent} durationSec={2} showLoader={false}>
                        {getMintSuccessView()}
                      </LoadedContainer>
                      :
                      <>
                        {
                          props.claimData != null &&
                          <>
                            <div className='w-full flex flex-col items-center'>
                              <HeroTitle color="black" items={['WELCOME TO']} />
                              <HeroTitle color="black" items={['A NEW KIND']} />
                              <HeroTitle color="black" items={['OF PLATFORM']} />
                            </div>
                            <span className={tw(
                              'text-3xl mt-5 deprecated_sm:text-xl w-full flex flex-col items-center',
                              'text-primary-txt text-center max-w-2xl'
                            )}>
                              Congratulations! It is time for you to mint your Genesis Key, and become a leader of this community led ecosystem!
                            </span>
                          </>
                        }
                      </>
                  }
                </>
                {
                  props.insiderClaimData != null && props.ownedTokenID == null && !mintSucceeded &&
                  <div className={tw(
                    'mt-12 flex w-full flex-col',
                    'items-center justify-center',
                    'uppercase font-hero-heading1 font-extrabold tracking-wide'
                  )}>
                    <div className='mb-12'>
                      <HeroTitle color="black" items={['Thank you for ']} />
                      <HeroTitle color="black" items={['supporting']} />
                      <HeroTitle color="black" items={['nft.com']} />
                    </div>
                    <span className={tw(
                      'text-lg mb-10 normal-case font-rubik',
                      'text-primary-txt text-center'
                    )}>
                      Click the button below to claim your Genesis Key.
                    </span>
                    <Button
                      type={ButtonType.PRIMARY}
                      size={ButtonSize.LARGE}
                      label="Claim your key"
                      disabled={mintSucceeded || submitting}
                      loading={submitting}
                      loadingText={'Claiming...'}
                      onClick={async () => {
                        try {
                          const result = await genesisKeyTeamDistributor
                            .connect(signer)
                            .claim(
                              props.insiderClaimData.index,
                              currentAddress,
                              BigNumber.from(props.insiderClaimData.amount),
                              props.insiderClaimData.proof,
                              {
                                value: BigNumber.from(0)
                              }
                            );

                          setSubmitting(true);

                          if (result) {
                            await result.wait(1);
                            playKeyVideo();
                            mutateOwnedGKs();
                            setMintSucceeded(true);
                          }
                          setSubmitting(false);
                        } catch (err) {
                          setSubmitting(false);
                        }
                      }}
                    />
                  </div>
                }
                {!mintSucceeded && <span className={tw(
                  'text-center items-center max-w-xl text-xs',
                  'items-center my-5 w-full',
                  'text-primary-txt'
                )}>
                  There are gas fees associated with claiming your Genesis Key. {' '}
                  By clicking the {'"'}Claim Your Key{'"'} button,{' '}
                  you agree to our{' '}
                  <span
                    onClick={() => {
                      window.open(
                        'https://cdn.nft.com/nft_com_terms_of_service.pdf',
                        '_open'
                      );
                    }}
                    className='cursor-pointer hover:underline text-link'
                  >
                    Terms of Service
                  </span>{' '} and {' '}
                  <span
                    onClick={() => {
                      window.open(
                        'https://cdn.nft.com/nft_com_privacy_policy.pdf',
                        '_open'
                      );
                    }}
                    className='cursor-pointer hover:underline text-link'
                  >
                    Privacy Policy
                  </span>.{' '}
                  Your Genesis Key will allow you to mint four (4) profile names.{' '}
                  Certain profile names may be unavailable for claiming.{' '}
                  Users are prohibited from selecting a profile name that violates{' '}
                  the rights of any third party (including any trademark rights), that{' '}
                  impersonates a third party, or that is otherwise misleading or a{' '}
                  breach of our {' '}
                  <span
                    onClick={() => {
                      window.open(
                        'https://cdn.nft.com/nft_com_terms_of_service.pdf',
                        '_open'
                      );
                    }}
                    className='cursor-pointer hover:underline text-link'
                  >
                    Terms of Service
                  </span>.
                </span>}
              </div>
          }
        </div>
      </div>
    </>
  );
}
