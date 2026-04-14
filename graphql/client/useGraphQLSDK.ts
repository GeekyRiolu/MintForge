import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { getSdk, Sdk } from 'graphql/generated/types';

import { useContext, useEffect, useState } from 'react';

export function useGraphQLSDK(): Sdk {
  const { client } = useContext(GraphQLContext);
  const [sdk, setSdk] = useState(getSdk(client));
  useEffect(() => {
    setSdk(getSdk(client));
  }, [client]);
  return sdk;
}