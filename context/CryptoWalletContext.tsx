'use client';
import CustomAvatar from 'components/elements/CustomAvatar';
import Disclaimer from 'components/elements/Disclaimer';
import { Doppler, getEnv } from 'utils/env';
import { isProd } from 'utils/isEnv';

import {
  connectorsForWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { ReactNode, useMemo } from 'react';
import { rainbowLight } from 'styles/RainbowKitThemes';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { goerli, mainnet } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const CryptoWalletProvider = ({ children }: { children: ReactNode }) => {
  const { chains, provider } = useMemo(() => {
    return configureChains(
      !isProd
        ? [mainnet, goerli]
        : [mainnet],
      [
        jsonRpcProvider({
          rpc: (chain) => {
            const url = new URL(
              getEnv(Doppler.NEXT_PUBLIC_BASE_URL) + 'api/ethrpc'
            );
            url.searchParams.set('chainId', chain?.id.toString());
            return {
              http: url.toString(),
            };
          },
        }),
      ]
    );
  }, []);

  const connectors = useMemo(() => {
    return connectorsForWallets([
      {
        groupName: 'Recommended',
        wallets: [
          metaMaskWallet({ chains, shimDisconnect: true }),
          // safeWallet({ chains }),
          rainbowWallet({ chains }),
        ],
      },
      {
        groupName: 'Others',
        wallets: [
          walletConnectWallet({ chains }),
          coinbaseWallet({ chains, appName: 'NFT.com' }),
          trustWallet({ chains }),
          ledgerWallet({ chains }),
          argentWallet({ chains }),
        ],
      },
    ]);
  }, [chains]);

  const wagmiClient = useMemo(() => {
    return createClient({
      autoConnect: true,
      connectors,
      provider,
    });
  }, [connectors, provider]);

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          appInfo={{
            appName: 'NFT.com',
            learnMoreUrl: 'https://docs.nft.com/what-is-a-wallet',
            disclaimer: Disclaimer,
          }}
          theme={rainbowLight}
          chains={chains}
          initialChain={
            getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID) === goerli.id.toString()
              ? goerli
              : mainnet
          }
          avatar={CustomAvatar}
        >
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
};

export default CryptoWalletProvider;
