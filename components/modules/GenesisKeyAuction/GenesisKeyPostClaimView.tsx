import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { HeroTitle } from 'components/modules/Hero/HeroTitle';
import { tw } from 'utils/tw';

import { useRouter } from 'next/router';

export interface GenesisKeyPostClaimViewProps {
  onBack: () => void
}

export function GenesisKeyPostClaimView(props: GenesisKeyPostClaimViewProps) {
  const router = useRouter();
  return (
    <div className='flex flex-col items-center text-primary-txt dark:text-primary-txt-dk'>
      <HeroTitle items={['WELCOME TO THE']} />
      <HeroTitle items={['DIGITAL RENAISSANCE']} />
      <div className='flex flex-col max-w-3xl items-center'>
        <div className="flex flex-col mt-4  text-center ">
          <span className='font-bold text-lg'>
          Please check your wallet in our sidebar to ensure you have received your key.
          </span>
        </div>
        <div className='mt-4 text-lg text-center'>
          As a Genesis Key Holder you have the ability to mint four (4) NFT.com Profiles. {' '}
          You can mint them now or at your convenience.
        </div>
        <div className='mt-4 text-lg text-center'>
          Profile names are one-of-a-kind, meaning there will only ever be one NFT.com/hello. {' '}
          Mint your four profiles early for the best chance of getting the profile you want.
        </div>
        <div className='w-full flex mt-8 justify-center'>
          <div className={tw('flex w-full deprecated_sm:flex-col',
            'items-center justify-center',
            'uppercase font-hero-heading1 font-extrabold tracking-wide')}>
            <div className='w-2/4 deprecated_sm:w-3/4 deprecated_sm:mb-4 mr-2 deprecated_sm:mr-0 text-center'>
              <Button
                stretch
                size={ButtonSize.LARGE}
                onClick={props.onBack}
                label="Buy Another Key"
                type={ButtonType.PRIMARY}
              />
            </div>
            <div className='w-2/4 deprecated_sm:w-3/4 ml-2 deprecated_sm:ml-0 text-center'>
              <Button
                stretch
                size={ButtonSize.LARGE}
                onClick={() => {
                  router.push('/app/mint-profiles');
                }}
                label="Mint Profiles"
                type={ButtonType.PRIMARY}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}