import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import MintProfileModal from 'components/modules/ProfileFactory/MintProfileModal';
import { useNftQuery } from 'graphql/hooks/useNFTQuery';
import { useProfileTokenQuery } from 'graphql/hooks/useProfileTokenQuery';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useGetProfileClaimHash } from 'hooks/useProfileClaimHash';
import { isNullOrEmpty } from 'utils/format';
import { getAddress } from 'utils/httpHooks';

import MintProfileInputField from './MintProfileInputField';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback,useEffect, useState } from 'react';

const DynamicMintProfileModal = dynamic<React.ComponentProps<typeof MintProfileModal>>(() => import('components/modules/ProfileFactory/MintProfileModal').then(mod => mod.default));

export default function MintFreeProfileCard() {
  const [profileURI, setProfileURI] = useState(null);
  const [input, setInput] = useState([]);
  const [profileStatus, setProfileStatus] = useState('');
  const [hasListings, setHasListings] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [minting, setMinting] = useState(false);

  const { profileTokenId } = useProfileTokenQuery(profileURI || '');
  const defaultChainId = useDefaultChainId();
  const { data: nft } = useNftQuery(getAddress('nftProfile', defaultChainId), profileTokenId?._hex);
  const { profileClaimHash } = useGetProfileClaimHash(profileURI);

  const setMintingModal = useCallback((isOpen) => {
    if(isOpen){
      setMinting(true);
      setModalOpen(true);
    } else {
      setMinting(false);
      setModalOpen(false);
    }
  }, [setModalOpen]);

  useEffect(() => {
    if(profileStatus === 'Listed') {
      setHasListings(true);
    } else {
      setHasListings(false);
    }
    if(isNullOrEmpty(profileURI) || profileURI === ''){
      setInput([]);
    } else {
      setInput([{
        profileURI,
        profileStatus,
        type: 'input-Free',
        hash: profileClaimHash?.hash,
        signature: profileClaimHash?.signature
      }]);
    }
  }, [profileURI, profileStatus, profileClaimHash]);

  useEffect(() => {
    setProfileStatus(profileTokenId ? nft?.listings?.totalItems > 0 ? 'Listed' : 'Owned' : 'Available');
  }, [profileTokenId, nft]);

  return (
    <div className='relative mt-16 minlg:mt-12 z-50 px-5'>
      <div className='max-w-[600px] mx-auto bg-white rounded-[20px] pt-6 minmd:pt-[64px] px-4 minmd:px-12 minlg:px-[76px] pb-10 font-medium'>
        <h2 className='text-[32px] font-medium'>Claim your free NFT Profile</h2>

        <p className='mt-9 text-xl font-normal'>Every wallet receives <span className='font-bold text-transparent bg-gradient-to-r from-[#FAC213] to-[#FF9B37] bg-clip-text'>one free mint!</span></p>
        <p className='text-[#707070] font-normal mt-4 mb-2'>Create your NFT Profile to build your social identity</p>

        <MintProfileInputField
          minting={minting}
          setFreeProfile={setProfileURI}
          name={'input-Free'}
          type="Free"
        />

        <div className='mt-12 minlg:mt-[59px]'>
          {hasListings ?
            <Link href={`/app/nft/0x98ca78e89Dd1aBE48A53dEe5799F24cC1A462F2D/${profileTokenId?.toNumber()}`}>
              <Button
                type={ButtonType.PRIMARY}
                size={ButtonSize.LARGE}
                label='View NFT.com listing'
                onClick={() => null}
              />
            </Link>
            :
            <Button
              type={ButtonType.PRIMARY}
              size={ButtonSize.LARGE}
              disabled={input.some(item => item.profileStatus === 'Owned') || isNullOrEmpty(input) || input.some(item => item.profileURI === '') }
              loading={minting}
              label='Mint your NFT Profile'
              onClick={async () => {
                if (
                  minting
                ) {
                  return;
                }
                setModalOpen(true);
              }}
            />
          }
        </div>
        <Link href='https://docs.nft.com/nft-profiles/what-is-a-nft-profile' passHref className='mt-4' legacyBehavior>
          <a target="_blank" >
            <p className='text-[#727272] text-left minlg:text-center mt-4 text-xl minlg:text-base font-normal'>
            Learn more about <span className='text-black inline font-medium'>NFT Profiles</span>
            </p>
          </a>
        </Link>
      </div>
      <DynamicMintProfileModal isOpen={modalOpen} setIsOpen={setMintingModal} profilesToMint={input} type='Free' />
    </div>
  );
}
