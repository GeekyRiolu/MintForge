import { useMyPhotoQuery } from 'graphql/hooks/useMyPhotoQuery';
import { joinClasses } from 'utils/format';

import Jazzicon from '@metamask/jazzicon';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import Identicon1 from 'react-identicons';
import { useThemeColors } from 'styles/theme/useThemeColors';
import { useAccount } from 'wagmi';

export interface LoggedInIdenticonProps {
  large?: boolean;
  customSize?: number;
  round?: boolean;
  border?: boolean;
  customString?: string;
}

export default function LoggedInIdenticon({ large, customSize, round, border, customString }: LoggedInIdenticonProps) {
  const ref = useRef<HTMLDivElement>();

  const { address: currentAddress } = useAccount();
  const { myPhoto, loading } = useMyPhotoQuery();
  const { primaryIcon } = useThemeColors();

  useEffect(() => {
    if (currentAddress && ref.current) {
      ref.current.innerHTML = '';
      ref.current.appendChild(Jazzicon(16, parseInt(currentAddress.slice(2, 10), 16)));
    }
  }, [currentAddress]);

  if (myPhoto && !loading) {
    return (
      <Image
        className={joinClasses(
          currentAddress == null ? 'hidden' : '',
          round === true ? 'rounded-full' : '',
          large === true ? 'h-32 w-32' : 'h-10 w-10',
          border === true ? 'border-4' : ''
        )}
        style={{ borderColor: primaryIcon }}
        src={myPhoto}
        alt={currentAddress}
      />
    );
  }

  // 'polkadot', 'substrate', 'beachball' or 'jdenticon'
  return <Identicon1 size={customSize || (large === true ? 120 : 32)} string={customString || currentAddress} />;
}
