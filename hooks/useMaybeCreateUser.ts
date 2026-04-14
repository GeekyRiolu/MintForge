import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { useCreateUserMutation } from 'graphql/hooks/useCreateUserMutation';
import { useMeQuery } from 'graphql/hooks/useMeQuery';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';

import { useSupportedNetwork } from './useSupportedNetwork';

import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';

export function useMaybeCreateUser(): void {
  const { address: currentAddress } = useAccount();
  const { chain } = useNetwork();
  const { signed } = useContext(GraphQLContext);
  const { isSupported } = useSupportedNetwork();
  const router = useRouter();
  const [recentlyCreatedUser, setRecentlyCreatedUser] = useState(false);
  const { me: meResult, mutate: mutateMe } = useMeQuery();
  const myWalletAddress = meResult?.myAddresses?.map(i => ethers.utils.getAddress(i.address));
  const currentUserMatchesUserId = myWalletAddress?.includes(ethers.utils.getAddress(currentAddress || ''));

  const { createUser, creating } = useCreateUserMutation({
    onCreateSuccess: () => {
      mutateMe();
    },
    onCreateFailure: () => {
      // todo: internal error logging.
    },
  });

  const getCacheKey = (address: string, chainId: number) => {
    return 'uidForWallet:' + address + ':chainId:' + chainId;
  };

  useEffect(() => {
    setRecentlyCreatedUser(false);
  }, [currentAddress, chain?.id]);

  useEffect(() => {
    if (isNullOrEmpty(currentAddress)) {
      return;
    }

    const cachedUserId = localStorage.getItem(getCacheKey(currentAddress, chain?.id));

    if (
      (meResult == null || (cachedUserId != meResult?.id)) &&
      (!creating) &&
      (signed) &&
      (isSupported)
    ) {
      (async () => {
        if (meResult == null && !recentlyCreatedUser) {
          const referredBy = router?.query?.makerReferralCode?.toString() || null;
          const referralUrl = router?.query?.referralUrl?.toString() || null;
          const referralId = router?.query?.receiverReferralCode?.toString() || null;
          const userData = isNullOrEmpty(referredBy) && isNullOrEmpty(referralUrl) && isNullOrEmpty(referralId) ?
            {
              username: `ethereum-${ethers.utils.getAddress(currentAddress || '')}`,
              wallet: {
                address: currentAddress,
                chainId: String(chain?.id || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)),
                network: 'ethereum',
              }
            }
            : {
              referredBy: referredBy,
              referredUrl: referralUrl,
              referralId: referralId,
              username: `ethereum-${ethers.utils.getAddress(currentAddress || '')}`,
              wallet: {
                address: currentAddress,
                chainId: String(chain?.id || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)),
                network: 'ethereum',
              }
            };

          const result = await createUser(userData);

          mutateMe();
          setRecentlyCreatedUser(true);
          if (result?.signUp?.id) localStorage.setItem(getCacheKey(currentAddress, chain?.id), result?.signUp?.id);
        } else {
          if (meResult?.id && currentUserMatchesUserId) localStorage.setItem(getCacheKey(currentAddress, chain?.id), meResult?.id);
        }
      })();
    }
  }, [isSupported, createUser, currentAddress, chain?.id, creating, signed, router?.query, meResult, mutateMe, currentUserMatchesUserId, recentlyCreatedUser]);

  return;
}
