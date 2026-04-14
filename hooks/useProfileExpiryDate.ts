import { isNullOrEmpty } from 'utils/format';

import { useAllContracts } from './contracts/useAllContracts';

import { BigNumber } from 'ethers';
import moment from 'moment';
import useSWR, { mutate } from 'swr';

export function useProfileExpiryDate(profileURI: string | null) {
  const { nftProfile } = useAllContracts();

  const keyString = 'ProfileExpiryDate-' + profileURI;

  const { data } = useSWR(keyString, async () => {
    if(isNullOrEmpty(profileURI)){
      return;
    }
    const expiry = await nftProfile.getExpiryTimeline([profileURI]);
    return moment.unix(Number(BigNumber.from(expiry[0]))).format('MM/DD/YYYY');
  });

  return {
    expiry: data,
    mutate: () => {
      mutate(keyString);
    }
  };
}
