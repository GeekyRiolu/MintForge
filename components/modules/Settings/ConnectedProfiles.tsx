import { RelatedProfilesStructOutput } from 'constants/typechain/Nft_resolver';
import { PendingAssociationOutput } from 'graphql/generated/types';

import AssociatedProfile from './AssociatedProfile';

import { PartialDeep } from 'type-fest';
import { useAccount } from 'wagmi';

type RemovedProfileAssociation = {
  hidden: boolean;
  id: string;
  owner: string;
  url: string;
}

type ConnectedProfilesProps = {
  associatedProfiles : {
    pending: PartialDeep<PendingAssociationOutput>[];
    accepted: RelatedProfilesStructOutput[];
    removed: PartialDeep<RemovedProfileAssociation>[];
  };
};

export default function ConnectedProfiles({ associatedProfiles }: ConnectedProfilesProps) {
  const { address: currentAddress } = useAccount();
  return (
    <div id="profiles" className='w-full font-noi-grotesk'>
      <h2 className='font-noi-grotesk tracking-wide font-bold text-black text-2xl mb-1'>Manage Address</h2>
      <p className='text-blog-text-reskin mb-4'>
        The following NFT Profiles have requested to associate to your address. Only approve those you would like to give permission to display your NFTs.
      </p>
      <div>
        <p className='text-blog-text-reskin mb-2 font-semibold'>Associated Profiles</p>
        
        {
          (
            !associatedProfiles?.accepted?.length &&
            !associatedProfiles?.pending?.length &&
            !associatedProfiles?.removed?.length
          ) || !currentAddress
            ? (
              <p className='text-sm font-medium'>No profile association requests</p>
            )
            : <p className='text-blog-text-reskin mb-2 text-sm font-medium'>Profile Name</p>
        }
        {currentAddress &&
        <>
          {associatedProfiles?.accepted?.map((profile, index)=> (
            <AssociatedProfile profile={profile} key={index}/>
          ))}
          {associatedProfiles?.pending?.map((profile, index)=> (
            <AssociatedProfile profile={profile} pending key={index} />
          ))}
          {associatedProfiles?.removed?.map((profile, index)=> (
            <AssociatedProfile profile={profile} isRemoved key={index} />
          ))}
        </>
        }
      </div>
    </div>
  );
}
  