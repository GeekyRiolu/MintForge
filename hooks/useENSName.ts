import { isAddress } from 'utils/helpers';

import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';

/**
 * Does a reverse lookup for an address to find its ENS name.
 * Note this is not the same as looking up an ENS name to find an address.
 */
export default function useENSName(address?: string): {
  ENSName: string | null;
  loading: boolean;
} {
  const provider = useProvider();

  const [ENSName, setENSName] = useState<{
    ENSName: string | null;
    loading: boolean;
  }>({
    loading: false,
    ENSName: null,
  });

  useEffect(() => {
    const validated = isAddress(address);
    if (!provider || !validated) {
      setENSName({ loading: false, ENSName: null });
      return;
    } else {
      let stale = false;
      setENSName({ loading: true, ENSName: null });
      provider
        .lookupAddress(validated)
        .then(name => {
          if (!stale) {
            if (name) {
              setENSName({ loading: false, ENSName: name });
            } else {
              setENSName({ loading: false, ENSName: null });
            }
          }
        })
        .catch(() => {
          if (!stale) {
            setENSName({ loading: false, ENSName: null });
          }
        });

      return () => {
        stale = true;
      };
    }
  }, [provider, address]);

  return ENSName;
}
