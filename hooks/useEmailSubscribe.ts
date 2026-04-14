import { Doppler, getEnv } from 'utils/env';

import { useCallback } from 'react';

export interface FetchCollectionNFTsData {
  subscribe: (email: string) => Promise<void>;
}
  
export function useEmailSubscribe(): FetchCollectionNFTsData {
  const subscribe = useCallback(async (email: string) => {
    async () => {
      try {
        const result = await fetch(`${getEnv(Doppler.NEXT_PUBLIC_GRAPHQL_URL).replace('/graphql', '')}/subscribe/${email?.toLowerCase()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
          
        if (result.status == 200) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        console.log('error while subscribing: ', err);
        return false;
      }
    };
  }, []);
  
  return {
    subscribe
  };
}
  
