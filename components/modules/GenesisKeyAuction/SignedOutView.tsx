import { WalletRainbowKitButton } from 'components/elements/WalletRainbowKitButton';
import { HeroTitle } from 'components/modules/Hero/HeroTitle';

import { isMobile } from 'react-device-detect';

export interface SignedOutViewProps {
  auctionText?: boolean;
  ended?: boolean;
}

export function SignedOutView(props: SignedOutViewProps) {
  return (
    <div className='flex flex-col items-center px-8 mt-8'>
      {
        props.auctionText === true ?
          <>
            <HeroTitle color={'white'} items={['Unlock the NFT Platform Beta']}/>
            <HeroTitle color={'white'} items={['with a Genesis Key']}/>
          </>
          : <>
            <HeroTitle color={'black'} items={['CONNECT YOUR WALLET']}/>
          </>
      }
      <div className="text-base my-5 text-primary-txt-dk max-w-nftcom">
        Connect with one of our available wallet providers below to get started. After connecting your wallet, you will reach the Genesis Key purchase screen.
      </div>
      <div
        className="rounded-xl items-center p-5 flex flex-col"
        style={{ width: isMobile ? '90%' : '30rem' }}>
        <WalletRainbowKitButton signInButton={true} />
      </div>
    </div>
  );
}
