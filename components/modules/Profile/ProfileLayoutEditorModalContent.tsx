import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { ProfileLayoutType } from 'graphql/generated/types';
import { tw } from 'utils/tw';

import { ProfileContext } from './ProfileContext';

import Image from 'next/image';
import { X } from 'phosphor-react';
import { useContext, useEffect, useState } from 'react';

export interface ProfileLayoutEditorModalContentProps {
  savedLayoutType: ProfileLayoutType;
  onClose: () => void;
}

export function ProfileLayoutEditorModalContent(props: ProfileLayoutEditorModalContentProps) {
  const layoutImages = {
    'Default': '/group_8.webp',
    'Mosaic': '/group_9.webp',
    'Featured': '/group_10.webp',
    'Spotlight': '/group_11.webp',
  };
  const {
    draftLayoutType,
    setDraftLayoutType
  } = useContext(ProfileContext);

  const [originalLayout, setOriginalLayout] = useState(null);

  useEffect(() => {
    if (originalLayout == null) {
      setOriginalLayout(draftLayoutType);
    }
  }, [draftLayoutType, originalLayout]);

  return (
    <div className={tw(
      'absolute top-0 left-0 h-[60%] md:h-screen overflow-scroll w-screen',
      'dark:bg-secondary-bg-dk bg-white',
      'text-primary-txt dark:text-primary-txt-dk',
      'p-5'
    )}>
      <div className='flex items-center justify-between w-full'>
        <span className='text-4xl'>Select Layout</span>
        <div className='flex items-center cursor-pointer' onClick={() => {
          setDraftLayoutType(originalLayout);
          props.onClose();
        }}>
          <span className='mr-4 text-2xl'>Close</span>
          <X size={20} />
        </div>
      </div>
      <div className='w-full flex flex-wrap mt-4'>
        {[
          ProfileLayoutType.Default,
          ProfileLayoutType.Mosaic,
          ProfileLayoutType.Featured,
          ProfileLayoutType.Spotlight
        ].map((layout) => {
          const selected = layout === (draftLayoutType ?? props.savedLayoutType);
          return (
            <div
              className={tw(
                'relative cursor-pointer',
                'sm:w-full md:w-1/3 w-1/4 aspect-[3/2]',
                'mb-4 px-2'
              )}
              onClick={() => {
                setDraftLayoutType(layout);
              }}
              key={layout}
            >
              <div
                className={tw(
                  'relative flex items-center justify-center',
                  'rounded-lg border h-full w-full',
                  selected ? 'border-link': 'border-white'
                )}
                data-testid={layout+'-layout-option2'}
              >
                <span className='text-2xl' data-testid={layout+'-layout-option1'}>{layout}</span>
                <div className='absolute top-0 left-0 h-full w-full rounded-lg'>
                  <div className="w-full h-full p-4">
                    <div className='relative w-full h-full'>
                      <Image
                        data-testid={layout+'-layout-option3'}
                        alt="layout type"
                        src={layoutImages[layout]}
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div data-testid="ConfirmButton" className='flex flex-col w-full items-center mt-4' onClick={props.onClose}>
        <Button
          size={ButtonSize.LARGE}
          label={'Confirm'}
          onClick={() => {
            props.onClose();
          }}
          type={ButtonType.PRIMARY}
        />
        <div
          className='mt-4 text-link hover:underline cursor-pointer'
          onClick={() => {
            setDraftLayoutType(originalLayout);
            props.onClose();
          }}
        >
          Cancel
        </div>
      </div>
    </div>
  );
}
