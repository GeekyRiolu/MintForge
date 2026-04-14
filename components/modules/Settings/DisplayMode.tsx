import { ProfileViewType } from 'graphql/generated/types';
import { useProfileQuery } from 'graphql/hooks/useProfileQuery';
import { useUpdateProfileViewMutation } from 'graphql/hooks/useUpdateProfileViewMutation';
import { Doppler, getEnvBool } from 'utils/env';

import AssociatedProfileSelect from './AssociatedProfileSelect';
import ConnectedCollections from './ConnectedCollections';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type DisplayModeProps = {
  selectedProfile: string;
};

export default function DisplayMode({ selectedProfile }: DisplayModeProps) {
  const [selected, setSelected] = useState('');
  const { profileData } = useProfileQuery(selectedProfile);
  const { updateProfileView } = useUpdateProfileViewMutation();

  useEffect(() => {
    if (profileData?.profile?.profileView === 'Collection') {
      setSelected('Collection');
    } else {
      setSelected('Gallery');
    }
  }, [profileData?.profile?.profileView, selectedProfile]);

  const handleChange = event => {
    setSelected(event.target.value);
    if (event.target.value !== ProfileViewType.Collection) {
      toast.success('Saved!');
      updateProfileView({ profileViewType: event.target.value, url: selectedProfile }).catch(() => toast.error('Error'));
      gtag('event', 'Profile View Updated', {
        profile: selectedProfile,
        profileViewType: event.target.value
      });
    }
  };

  const handleAssociatedContract = () => {
    updateProfileView({ profileViewType: selected as ProfileViewType, url: selectedProfile }).catch(() => toast.error('Error'));
    gtag('event', 'Profile View Updated', {
      profile: selectedProfile,
      profileViewType: selected
    });
  };

  return (
    <div id="display" className='mt-10 font-noi-grotesk'>
      <h2 className='text-black mb-2 font-bold text-2xl tracking-wide'>Select Display Mode</h2>
      <p className='text-[#6F6F6F]'>Choose how you plan to use your NFT Profile.</p>

      <div className='mt-4'>
        <input checked={selected === 'Gallery'} onChange={handleChange} className="form-radio text-[#F9D963] border-2 border-[#D5D5D5] w-4 h-4 focus:ring-[#F9D963]" type="radio" name="gallery-display" value='Gallery' id='Gallery' />
        <label className="ml-2 text-sm" htmlFor="Gallery">
          NFT Gallery
        </label>
        <p className='mt-1 mb-4 text-xs text-[#6F6F6F] ml-6 leading-6'>
          Display NFTs that you have collected and hold in any associated address.
        </p>

        <input checked={selected === 'Collection'} onChange={handleChange} className="form-radio text-[#F9D963] border-2 border-[#D5D5D5] w-4 h-4 focus:ring-[#F9D963]" type="radio" name="gallery-display" value='Collection' id='Collection' />
        <label className="ml-2 text-sm" htmlFor="Collection">
          NFT Collection
        </label>
        <p className='mt-1 text-xs text-[#6F6F6F] ml-6 leading-6'>
          Your NFT Profile will serve as the landing page for your NFT Collection.
        </p>
      </div>

      {
        selected === 'Collection' && (
          getEnvBool(Doppler.NEXT_PUBLIC_OFFCHAIN_ASSOCIATION_ENABLED)
            ? <AssociatedProfileSelect {...{ profileId: profileData.profile.id, associatedContract: profileData.profile.associatedContract, onAssociatedContract: handleAssociatedContract }} />
            : <ConnectedCollections {...{ selectedProfile }} />
        )
      }
    </div>
  );
}
