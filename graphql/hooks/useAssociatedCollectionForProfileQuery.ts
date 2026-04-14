import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Collection } from 'graphql/generated/types';
import { Doppler,getEnv } from 'utils/env';
import { getChainIdString } from 'utils/helpers';

import useSWR, { mutate } from 'swr';
import { PartialDeep } from 'type-fest';
import { useNetwork } from 'wagmi';

export interface AssociatedCollectionForProfileData {
  data: PartialDeep<Collection>;
  loading: boolean;
  mutate: () => void;
}

export function useAssociatedCollectionForProfile(profileUrl: string): AssociatedCollectionForProfileData {
  const sdk = useGraphQLSDK();
  
  const keyString = 'AssociatedCollectionForProfile' + profileUrl;

  const { chain } = useNetwork();
  
  const { data } = useSWR(keyString, async () => {
    try {
      const result = await sdk.AssociatedCollectionForProfile({
        profile: profileUrl,
        chainId: getChainIdString(chain?.id) ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)
      });
      return result;
    } catch (error) {
      console.log('Failed to load associated collection.');
    }
  });
  return {
    data: data?.associatedCollectionForProfile?.collection,
    loading: data == null,
    mutate: () => {
      mutate(keyString);
    },
  };
}