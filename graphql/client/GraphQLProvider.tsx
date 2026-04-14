import { SignatureModal } from 'components/elements/SignatureModal';
import { GraphQLClient } from 'graphql-request';
import { useSupportedNetwork } from 'hooks/useSupportedNetwork';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';
import { getAPIURL } from 'utils/isEnv';

import moment from 'moment';
import { createContext, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { useAccount, useNetwork, useSignMessage } from 'wagmi';

const defaultClient = new GraphQLClient(getAPIURL());

export const GraphQLContext = createContext({
  client: defaultClient,
  signed: false,
  trySignature: () => null,
});

export const GraphQLProviderProps = {};

/**
 * gQL provider which sets the required auth
 * headers specific to nft.com.
 */
export default function GraphQLProvider(props: PropsWithChildren<typeof GraphQLProviderProps>) {
  const { isSupported } = useSupportedNetwork();
  const { address: currentAddress } = useAccount();

  const { chain } = useNetwork();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(defaultClient);
  const [signed, setSigned] = useState(false);
  const [sigRejected, setSigRejected] = useState(!currentAddress);
  const unixTimestamp = moment().add(6, 'days').add(23, 'hours').unix();
  const { signMessageAsync } = useSignMessage({
    message: `${getEnv(Doppler.NEXT_PUBLIC_APOLLO_AUTH_MESSAGE)} ${unixTimestamp}`,
    onSuccess(data) {
      localStorage.setItem('signatureData', JSON.stringify({
        signature: data,
        address: currentAddress,
        timestamp: unixTimestamp
      }));
      gtag('event', 'SignIn', {
        ethereumAddress: currentAddress
      });
      setSigned(true);
    },
    onError(error) {
      console.log(error);
      setSigned(false);
    }
  });

  const createSignedClient = useCallback((signature: string, timestamp: string) => {
    const gqlClient = new GraphQLClient(getAPIURL() + '/api', {
      cache: 'default',
      headers: {
        authorization: signature,
        'chain-id': chain?.id == null ? null : String(chain?.id),
        chainId: chain?.id == null ? null : String(chain?.id),
        network: 'ethereum', // TODO: support new networks
        timestamp: timestamp
      },
    });
    setClient(gqlClient);
  }, [chain?.id]);

  const trySignature = useCallback(async () => {
    setSigned(false);
    /**
     * First check if there's a signature available in the cache.
     */
    const cachedSigData = localStorage.getItem('signatureData');
    if (!isNullOrEmpty(cachedSigData)) {
      try {
        const parsedSigData = JSON.parse(cachedSigData);
        const cachedAddress = parsedSigData['address'];
        const cachedSignature = parsedSigData['signature'];
        const cachedTimestamp = parsedSigData['timestamp'];
        if (currentAddress === cachedAddress && moment().unix() < cachedTimestamp && !isNullOrEmpty(cachedTimestamp)) {
          createSignedClient(cachedSignature, cachedTimestamp);
          setSigned(true);
          setLoading(false);
          return true;
        }
      } catch {
        setLoading(false);
        // fall through if invalid signature or incorrect address.
      }
    }
    try {
      setLoading(false);
      const signature = await signMessageAsync();
      createSignedClient(signature, String(unixTimestamp));
      return true;
    } catch (error) {
      setSigned(false);
      console.log('Failed to get login signature. Only public endpoints will succeed.');
      return false;
    }
  }, [currentAddress, createSignedClient, signMessageAsync, unixTimestamp]);

  useEffect(() => {
    if (!currentAddress) {
      setSigRejected(false);
    }
  }, [currentAddress]);

  useEffect(() => {
    if ((currentAddress && !isSupported) || sigRejected) {
      return;
    }
    if (isNullOrEmpty(currentAddress)) {
      setSigRejected(false);
    }
    (async () => {
      const sigResult = await trySignature();
      // we only want to count the rejection of a real signature request.
      // if there is no connected wallet, it should fail silently.
      setSigRejected(!sigResult && !isNullOrEmpty(currentAddress));
    })();
  }, [currentAddress, isSupported, trySignature, sigRejected]);

  return (
    <GraphQLContext.Provider
      value={{
        client,
        signed,
        trySignature,
      }}
    >
      {!signed &&
        <SignatureModal
          visible={!signed && !isNullOrEmpty(currentAddress) && !loading}
          showRetry={sigRejected}
          onRetry={trySignature}
        />
      }
      {props.children}
    </GraphQLContext.Provider>
  );
}
