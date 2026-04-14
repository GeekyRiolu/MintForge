import { useNonProfileModal } from 'hooks/state/useNonProfileModal';
import { sliceString } from 'utils/format';

import { Button, ButtonSize, ButtonType } from './Button';
import { Modal } from './Modal';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import router from 'next/router';
import previewCollection from 'public/collection-preview-image.webp';
import likeButton from 'public/icons/like-button.svg';
import previewNft from 'public/nft-preview-image.webp';
import previewProfile from 'public/profile-preview-image.webp';
import React from 'react';

export default function NonAuthLikeModal(){
  const { isOpen, likeData: { likedType, profileName }, setLikeData } = useNonProfileModal();
  const { openConnectModal } = useConnectModal();

  const preview = () => {
    const type = likedType.toLowerCase();
    switch (type) {
    case 'nft': return previewNft;
    case 'collection': return previewCollection;
    case 'profile': return previewProfile;
    default: return previewNft;
    }
  };

  const checkWidth = () => {
    const type = likedType.toLowerCase();
    if(type === 'nft' || type === 'profile') {
      return 'w-[216px]';
    }else {
      return 'w-[311px]';
    }
  };

  return (
    <Modal
      dark={false}
      pure
      closeBtnNoPaddings={true}
      visible={isOpen}
      loading={false}
      title={''}
      onClose={() => setLikeData(false)}>
      <div className="p-20 text-4xl flex items-center flex-col font-noi-grotesk">
        <h2 className="mb-9 font-medium">Create your <span className="textColorGradient">NFT.com</span> Profile<br/> so you can like this {likedType}</h2>
        <Image src={preview()} className={`${checkWidth()} mb-4`} alt={`${likedType} Preview Image`} />
        {likedType.toLowerCase() === 'profile'
          ? (
            <div className='text-[44px] flex items-center justify-between -mt-[3rem] mb-10'>
              <span className='text-[#FAC213]'>/</span>{sliceString(profileName, 14, false)}
              <Image src={likeButton} className='w-[40px] ml-4' alt={`${likedType} Preview Image`} />
            </div>
          )
          : null}
        <Button
          size={ButtonSize.XLARGE}
          stretch
          label={'Create profile'}
          type={ButtonType.PRIMARY}
          onClick={() => {
            setLikeData(false);
            router.push('/app/mint-profiles');
          }}/>
        <div className="mt-4 text-xl	text-[#6A6A6A]">
          Already have an account?
          <span onClick={() => {
            openConnectModal();
            setLikeData(false);
          }}>
            <a className='text-black hover:text-[#6A6A6A] cursor-pointer font-medium'> Sign in</a>
          </span>
        </div>
      </div>
    </Modal>
  );
}
