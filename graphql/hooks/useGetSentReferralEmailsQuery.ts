import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';

import useSWR, { mutate } from 'swr';
import { useAccount } from 'wagmi';

export interface GetSentReferralEmailsData {
  data: { __typename?: 'SentReferralEmailsOutput'; email: string; accepted: boolean; }[],
  loading: boolean;
  mutate: () => void;
}

export function useGetSentReferralEmailsQuery(profileUrl: string): GetSentReferralEmailsData {
  const sdk = useGraphQLSDK();
  const { address: currentAddress } = useAccount();

  const keyString = 'GetSentReferralEmailsQuery' + currentAddress + profileUrl;

  const { data } = useSWR(keyString, async () => {
    if(!currentAddress) {
      return null;
    }

    const result = await sdk.GetSentReferralEmails({
      profileUrl
    });

    return result.getSentReferralEmails.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  });
  
  return {
    data: data ?? null,
    loading: data == null,
    mutate: () => {
      mutate(keyString);
    },
  };
}