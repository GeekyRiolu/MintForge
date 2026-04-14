import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { BidsInput, MyBidsQuery } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';
import { sameAddress } from 'utils/helpers';

import { useContext } from 'react';
import useSWR, { mutate } from 'swr';
import { useAccount } from 'wagmi';

export interface IndividualBids {
  myBidsRaw: MyBidsQuery;
  error: any;
  mutate: () => void;
}

export function useMyBidsQuery(input: BidsInput): IndividualBids {
  const sdk = useGraphQLSDK();

  const { address: currentAddress } = useAccount();
  const { signed } = useContext(GraphQLContext);

  const keyString = 'MyBidsQuery ' + input?.profileId + currentAddress + signed;

  const { data, error } = useSWR(keyString, async () => {
    if (isNullOrEmpty(currentAddress) || !signed || input?.profileId == null) {
      return null;
    }
    const result = await sdk.MyBids({ input: input });

    // TODO: we shouldn't have to filter on the frontend.
    // Check if the filtering is broken on the backend
    result.myBids.items = result.myBids.items.filter(b =>
      sameAddress(b.wallet.address, currentAddress)
    );
    return result;
  });
  return {
    myBidsRaw: data,
    error: error,
    mutate: () => {
      mutate(keyString);
    },
  };
}
