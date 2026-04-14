import { Token } from '@uniswap/sdk-core';
import { goerli, mainnet } from 'wagmi/chains';

export const DAI = new Token(
  mainnet.id,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  18,
  'DAI',
  'Dai Stablecoin'
);

export const DAI_GOERLI = new Token(
  goerli.id,
  '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60',
  18,
  'DAI',
  'Mock DAI'
);

export const USDC = new Token(
  mainnet.id,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  6,
  'USDC',
  'USD//C'
);

export const USDC_GOERLI = new Token(
  goerli.id,
  '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
  6,
  'USDC',
  'USDC'
);

export const WETH = new Token(
  mainnet.id,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  6,
  'WETH',
  'Wrapped Ether'
);

export const WETH_GOERLI = new Token(
  goerli.id,
  '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  6,
  'WETH',
  'Wrapped Ether'
);
