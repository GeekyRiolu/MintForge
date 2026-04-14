import { SafeConnector } from '@gnosis.pm/safe-apps-wagmi';
import { Chain, Wallet } from '@rainbow-me/rainbowkit';

export interface SafeWalletOptions {
  chains: Chain[];
}

export const safeWallet = ({ chains }: SafeWalletOptions): Wallet => ({
  id: 'safe',
  name: 'Safe (Gnosis)',
  iconUrl: async () => (await import('/public/icons/safe-logo.svg')).default,
  iconBackground: '#000',
  createConnector: () => ({
    connector: new SafeConnector({ chains }),
  }),
});
