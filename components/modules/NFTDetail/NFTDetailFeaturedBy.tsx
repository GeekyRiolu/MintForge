import { RoundedCornerAmount, RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { useProfilesByDisplayedNft } from 'graphql/hooks/useProfilesByDisplayedNftQuery';
import { useProfileTokenQuery } from 'graphql/hooks/useProfileTokenQuery';
import { useProfileVisibleNFTCount } from 'graphql/hooks/useProfileVisibleNFTCount';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useOwnedGenesisKeyTokens } from 'hooks/useOwnedGenesisKeyTokens';
import { useProfileTokenOwner } from 'hooks/userProfileTokenOwner';
import { isNullOrEmpty } from 'utils/format';

import Link from 'next/link';
import GK from 'public/icons/Badge_Key.svg?svgr';
import NoActivityIcon from 'public/icons/no_activity.svg?svgr';
export interface NFTDetailFeaturedByProps {
  contract: string,
  tokenId: string
}

export function NFTDetailFeaturedBy(props: NFTDetailFeaturedByProps) {
  const defaultChainId = useDefaultChainId();
  const { data: profiles } = useProfilesByDisplayedNft(
    props.contract,
    props.tokenId,
    defaultChainId,
    true
  );

  if (profiles == null) {
    return null;
  }

  return <div className='flex flex-col w-full px-[16px]'>
    <span className="md:text-[24px] text-[28px] font-semibold font-noi-grotesk mb-2">
      Profiles that feature this NFT
    </span>
    {profiles?.map((profile, index) => {
      return (
        <div key={index} className='py-1 flex items-center justify-between h-[70px] border-b border-gray-200'>
          <div className='flex items-center w-max'>
            <RoundedCornerMedia
              priority={true}
              containerClasses='w-[44px] h-[44px] w-full aspect-square'
              variant={RoundedCornerVariant.Full}
              amount={RoundedCornerAmount.Medium}
              src={profile?.photoURL}
            />
            <div className="flex w-full items-center text-[20px] font-medium md:ml-3 ml-12 font-noi-grotesk my-4">
              <span className='font-dm-mono text-primary-yellow'>/</span>
              <span className='ml-1 whitespace-nowrap text-[#4D4D4D] text-ellipsis overflow-hidden'>{profile?.url}</span>
              <ShowGk profile={profile?.url} />
            </div>
          </div>

          <div className='flex items-center'>
            <PublicProfileNftsCount id={profile?.id} />
            <Link href={'/' + profile?.url} passHref>
              <div className='cursor-pointer rounded-[8px] md:px-7 md:py-1.5 px-10 py-2 bg-[#F9D54C] flex items-center text-black font-medium md:text-[14px[ text-[18px] justify-center'>
                  View
              </div>
            </Link>
          </div>
        </div>
      );
    })}
    {profiles.length == 0 && <div>
      <div className='flex items-center justify-center'>
        <NoActivityIcon className='mt-10 h-[300px]' />
      </div>
      <span className='md:text-[20px] text-[28px] font-medium font-noi-grotesk leading-10 mb-2 flex items-center justify-center mt-5 text-[#4D4D4D]'>Not Featured on a NFT.com Profile yet</span>
    </div>
    }
  </div>;
}

const ShowGk = ({ profile }: { profile: string }) => {
  const { profileTokenId } = useProfileTokenQuery(
    profile,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );
  const { profileOwner } = useProfileTokenOwner(
    profileTokenId,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );
  const { data: ownedGenesisKeyTokens } = useOwnedGenesisKeyTokens(profileOwner);
  const hasGks = !isNullOrEmpty(ownedGenesisKeyTokens);

  return hasGks && <GK className='w-[24px] h-[24px] ml-3' />;
};

const PublicProfileNftsCount = ({ id }: { id: string }) => {
  const defaultChainId = useDefaultChainId();
  const { totalItems } = useProfileVisibleNFTCount(
    [id],
    defaultChainId
  );

  return (
    <div className='lg:hidden flex w-full text-[18px] font-noi-grotesk mr-36'>
      <span className='font-bold mr-1'>{totalItems}</span>
      <span className='text-[#6A6A6A]'>NFTs Displayed</span>
    </div>
  );
};
