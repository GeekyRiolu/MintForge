import { currentAddress } from './constants';

import { BaseProvider, WebSocketProvider } from '@ethersproject/providers';
import { Chain } from '@wagmi/core';
import { hardhat } from '@wagmi/core/chains';
import * as allChains from '@wagmi/core/chains';
import { MockConnector } from '@wagmi/core/connectors/mock';
import { providers } from 'ethers';
import { Wallet } from 'ethers/lib/ethers';
import { Contract } from 'ethers/lib/ethers';
import { createClient, CreateClientConfig } from 'wagmi';

type Config = Partial<CreateClientConfig>

class EthersProviderWrapper extends providers.StaticJsonRpcProvider {

  toJSON() {
    return `<Provider network={${this.network.chainId}} />`;
  }

}

export function getNetwork(chain: Chain) {
  return {
    chainId: chain?.id,
    ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    name: chain.name,
  };
}

export function getSigners() {
  const provider = getProvider();
  const signers = currentAddress.map((x) => {
    const wallet = new Wallet(x.privateKey);
    return provider.getSigner(wallet.address);
  });
  return signers;
}

export function getProvider({ chainId }: { chainId?: number } = {}) {
  const chain = Object.values(allChains).find((x) => x.id === chainId) ?? hardhat;
  const network = getNetwork(chain);
  const url = hardhat.rpcUrls.default.toString();
  return new EthersProviderWrapper(url, network);
}

export function setupWagmiClient(config: Config = {}, connectors?: MockConnector[]) {
  return createClient<BaseProvider, WebSocketProvider>({
    connectors: connectors ?? [
      new MockConnector({
        options: {
          signer: getSigners()[0],
        },
      }),
    ],
    provider: getProvider,
    ...config,
  });
}

class EthersWebSocketProviderWrapper extends providers.WebSocketProvider {

  toJSON() {
    return `<WebSocketProvider network={${this.network.chainId}} />`;
  }

}

export function getWebSocketProvider({ chainId }: { chainId?: number } = {}) {
  const chain = Object.values(allChains).find((x) => x.id === chainId) ?? hardhat;
  const network = getNetwork(chain);
  const url = hardhat.rpcUrls.default.toString().replace('http', 'ws');
  return new EthersWebSocketProviderWrapper(url, network);
}

export async function getUnclaimedTokenId(
  addressOrName: string,
  maxAttempts = 3,
) {
  function getRandomTokenId(from: number, to: number) {
    return Math.floor(Math.random() * to) + from;
  }

  let attempts = 0;
  const provider = getProvider();
  const contract = new Contract(
    addressOrName,
    [
      'function ownerOf(uint256 _tokenId) external view returns (address)',
      'function totalSupply() view returns (uint256)',
    ],
    provider,
  );
  const totalSupply = await contract.totalSupply();
  while (attempts < maxAttempts) {
    const randomTokenId = getRandomTokenId(1, totalSupply);
    try {
      await contract.ownerOf(randomTokenId);
    } catch (error) {
      return randomTokenId;
      break;
    }
    attempts += 1;
  }
  return false;
}