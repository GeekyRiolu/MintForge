import { configureChains, createClient } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { mainnet, goerli } from 'wagmi/chains';

// Minimal Wagmi client used at the app root so wagmi hooks
// don't throw during server-side prerendering.
const { chains, provider } = configureChains([mainnet, goerli], [publicProvider()]);

export const wagmiClient = createClient({
  autoConnect: true,
  provider,
});

export default wagmiClient;
