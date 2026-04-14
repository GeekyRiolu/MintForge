import { RoundedCornerAmount, RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { Profile } from 'graphql/generated/types';
import { useProfileVisibleNFTCount } from 'graphql/hooks/useProfileVisibleNFTCount';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { tw } from 'utils/tw';

import Link from 'next/link';
import { PartialDeep } from 'type-fest';

export interface ProfileCardProps {
  profile: PartialDeep<Profile>
  priority?: boolean
}

export function ProfileCard(props: ProfileCardProps) {
  const defaultChainId = useDefaultChainId();
  const { totalItems } = useProfileVisibleNFTCount(
    [props?.profile?.id],
    defaultChainId
  );

  return <Link href={'/' + props.profile?.url} passHref legacyBehavior>
    <a className={tw(
      'flex flex-col snap-always snap-center sn:no-scrollbar h-full w-72 shrink-0 p-4 border border-[#D5D5D5] rounded-md cursor-pointer mr-4 text-black text-base',
    )}
    >
      <RoundedCornerMedia
        priority={props?.priority}
        containerClasses='w-full aspect-square'
        variant={RoundedCornerVariant.All}
        amount={RoundedCornerAmount.Medium}
        src={props.profile?.photoURL}
      />
      <div className="flex w-full font-noi-grotesk my-4">
        <span className='text-xl font-medium font-dm-mono text-primary-yellow'>/</span>
        <span className='text-xl font-bold ml-1 whitespace-nowrap text-ellipsis overflow-hidden'>{props.profile?.url}</span>
      </div>
      <div className='flex w-full font-noi-grotesk'>
        <span className='text-secondary-txt'>NFTs Displayed:</span>
        <span className='font-bold ml-1'>{totalItems}</span>
      </div>
    </a>
  </Link>;
}
