import { Maybe } from 'graphql/generated/types';

import { useAllContracts } from './contracts/useAllContracts';

import axios from 'axios';
import { BigNumber } from 'ethers';
import useSWR from 'swr';

export function useProfileMetadata(tokenId: BigNumber | null): Maybe<any> {
  const { nftProfile } = useAllContracts();

  const { data } = useSWR(
    'ProfileMetadata' + tokenId?.toString(),
    async () => {
      if (tokenId == null) {
        return null;
      }
      const tokenURI = await nftProfile.tokenURI(tokenId);
      const tokenMetadata = await axios.get(tokenURI);
      const tokenMetadataJSON = tokenMetadata.data;
      return tokenMetadataJSON;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  return data ?? null;
}