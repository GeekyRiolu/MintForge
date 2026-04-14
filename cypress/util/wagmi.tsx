import { setupWagmiClient } from './utils';

import { QueryClient } from '@tanstack/react-query';
import { JSXElementConstructor,ReactElement, ReactNode } from 'react';
import { WagmiConfig, WagmiConfigProps } from 'wagmi';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent Jest from garbage collecting cache
      cacheTime: Infinity,
      // Turn off retries to prevent timeouts
      retry: false,
    },
  },
  logger: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    error: () => {},
    log: console.log,
    warn: console.warn,
  },
});

type Props = WagmiConfigProps & {
  children?:
  | ReactElement<any, string | JSXElementConstructor<any>>
  | ReactNode
}
export function wrapper(props: Props) {
  const client = props.client ?? setupWagmiClient({ queryClient });
  return <WagmiConfig client={client} {...props} />;
}

export {
  getProvider,
  getSigners,
  getWebSocketProvider,
} from './utils';
export {
  getUnclaimedTokenId,
  setupWagmiClient,
} from './utils';
export { act } from '@testing-library/react-hooks/dom';