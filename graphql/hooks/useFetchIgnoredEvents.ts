import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { IgnoredEventsInput,IgnoredEventsQuery } from 'graphql/generated/types';

import { useCallback } from 'react';

export interface IgnoredEventsQueryData {
  fetchEvents: (input: IgnoredEventsInput) => Promise<IgnoredEventsQuery>;
}

export function useFetchIgnoredEvents(): IgnoredEventsQueryData {
  const sdk = useGraphQLSDK();
  
  const fetchEvents = useCallback(async (input: IgnoredEventsInput) => {
    try {
      const result = await sdk.IgnoredEvents({ input });
      return result;
    } catch (error) {
      console.log(`Failed to fetch ignored events for ${input?.profileUrl}.`);
    }
  }, [sdk]);
  return {
    fetchEvents
  };
}