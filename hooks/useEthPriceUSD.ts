import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';

import useSWR from 'swr';

export function useEthPriceUSD() {
  const sdk = useGraphQLSDK();
  const keyString = 'ETH_USD';

  const { data } = useSWR(keyString, async () => {
    const result = await sdk.FetchEthUsd();

    return result?.fetchEthUsd ?? 0;
  });

  return data as number;
}
