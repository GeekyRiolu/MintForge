import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import Toast from 'components/elements/Toast';
import { NFTDetailContext } from 'components/modules/NFTDetail/NFTDetailContext';
import { Nft } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';
import { tw } from 'utils/tw';

import { useContext } from 'react';
import { useThemeColors } from 'styles/theme/useThemeColors';
import { PartialDeep } from 'type-fest';
import { useAccount } from 'wagmi';

export interface NftMemoProps {
  nft: PartialDeep<Nft>;
}

export const NftMemo = (props: NftMemoProps) => {
  const { nft } = props;
  const { alwaysBlack } = useThemeColors();
  const { address: currentAddress } = useAccount();

  const {
    editMemo,
    draftMemo,
    setDraftMemo,
    saveMemo,
    setEditMemo,
    clearDraft
  } = useContext(NFTDetailContext);

  const handleMemoChange = (event) => {
    let memoValue = event.target.value;
    if(memoValue.length === 0) {
      memoValue = '';
    }
    setDraftMemo(memoValue);
  };

  return (
    <>
      <div className='flex h-full w-full p-4 my-5'>
        <div className='flex h-full w-full'>
          <div className='h-full w-full'>
            <Toast />
            <div className='font-noi-grotesk text-[#6A6A6A] font-medium text-[16px] leading-5 relative'>Owner&apos;s Message</div>
            <textarea
              className={tw(
                'text-base w-full resize-none mt-2',
                'text-left px-3 pb-2 w-full rounded-[10px] font-medium h-32',
                'leading-5',
                'bg-[#F8F8F8]',
                'font-noi-grotesk text-[#1F2127]',
                `${editMemo ? 'border-2' : 'border-none'}`,
              )}
              maxLength={300}
              placeholder={currentAddress === (nft?.wallet?.address ?? props.nft?.owner) && isNullOrEmpty(nft?.memo) ? 'Enter message (optional)' : undefined}
              value={draftMemo ?? nft?.memo ?? ''}
              onChange={e => {
                handleMemoChange(e);
              }}
              style={{
                color: alwaysBlack,
              }}
              disabled={!currentAddress === (nft?.wallet?.address ?? props.nft?.owner) || !editMemo}
            />
            <div className='flex flex-row w-full justify-center items-center py-2 minxl:float-right minxl:flex-row-reverse minxl:w-1/4 minxl:-mb-12'>
              {currentAddress === (nft?.wallet?.address ?? props.nft?.owner) && !editMemo &&
            <Button
              size={ButtonSize.LARGE}
              type={ButtonType.PRIMARY}
              stretch
              label={'Edit'}
              onClick={() => {
                setEditMemo(true);
                setDraftMemo(draftMemo ?? nft?.memo ?? '');
              }}
            />
              }
              {currentAddress === (nft?.wallet?.address ?? props.nft?.owner) && editMemo &&
            <div className='inline-flex space-x-4'>
              <Button
                size={ButtonSize.LARGE}
                type={ButtonType.PRIMARY}
                label={'Save'}
                onClick={() => {
                  setEditMemo(false);
                  saveMemo();
                } }
              />
              <Button
                size={ButtonSize.LARGE}
                type={ButtonType.SECONDARY}
                label={'Clear'}
                onClick={() => {
                  clearDraft();
                } } />
            </div>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
