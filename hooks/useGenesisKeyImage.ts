import { Maybe } from 'graphql/generated/types';
import { processIPFSURL } from 'utils/ipfs';

import { useAllContracts } from './contracts/useAllContracts';

import { BigNumber } from 'ethers';
import useSWR from 'swr';

export function useGenesisKeyImage(tokenId: BigNumber | null): Maybe<string> {
  const { genesisKey } = useAllContracts();

  const { data } = useSWR(
    'GenesisKeyImage' + tokenId?.toString(),
    async () => {
      if (tokenId == null) {
        return null;
      }
      const tokenURI = await genesisKey.tokenURI(tokenId);

      const tokenMetadata = await fetch(
        processIPFSURL(tokenURI) ?? tokenURI
      );
      const tokenMetadataJSON = await tokenMetadata.json();
      return tokenMetadataJSON['image'];
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  return data ?? null;
}
