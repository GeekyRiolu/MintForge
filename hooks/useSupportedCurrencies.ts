import { NULL_ADDRESS } from 'constants/addresses';
import { Dai, Usdc, Weth } from 'constants/typechain';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { useEthPriceUSD } from 'hooks/useEthPriceUSD';
import { MAX_UINT_256 } from 'utils/marketplaceUtils';

import { BigNumberish } from '@ethersproject/bignumber';
import { useCallback, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';

export type NFTSupportedCurrency = {
  name: string;
  logo: string;
  contract: string;
  decimals: number;
  usd: (val: number) => number;
  allowance: (address: string, proxy: string) => Promise<BigNumberish>;
  setAllowance: (address: string, proxy: string) => Promise<boolean>;
  balance: (address: string) => Promise<BigNumberish>;
}

export type SupportedCurrency = 'WETH' | 'ETH' | 'DAI' | 'USDC';

export type NFTSupportedCurrencies = {
  [c in SupportedCurrency]: NFTSupportedCurrency
}

export type NFTSupportedCurrenciesInterface = {
  getByContractAddress: (address: string) => NFTSupportedCurrency,
  getBalanceMap: (address: string, currencies: SupportedCurrency[]) => Promise<Map<string, BigNumberish>>
  data: NFTSupportedCurrencies
};

export function useSupportedCurrencies(): NFTSupportedCurrenciesInterface {
  const ethPriceUSD = useEthPriceUSD();
  const {
    weth,
    dai,
    usdc,
  } = useAllContracts();
  const { data: signer } = useSigner();
  const provider = useProvider();

  const setAllowanceForContract = useCallback(async (
    contract: Dai | Weth | Usdc,
    currentAddress: string,
    proxy: string
  ): Promise<boolean> => {
    return contract
      .connect(signer ?? currentAddress)
      .approve(proxy, MAX_UINT_256)
      .then((tx) => tx.wait(1))
      .then(() => true)
      .catch(() => {
        console.log('Failed to get currency approval. Please connect wallet.');
        return false;
      });
  }, [signer]);

  const data: NFTSupportedCurrencies = useMemo(() => {
    return {
      'WETH': {
        name: 'WETH',
        logo: 'https://cdn.nft.com/weth.svg',
        contract: weth.address,
        decimals: 18,
        usd: (val: number) => ethPriceUSD ? Number(Number(val * ethPriceUSD).toFixed(2)) : 0,
        allowance: async (currentAddress: string, proxy: string) => {
          const wethAllowance = await weth.allowance(currentAddress, proxy ?? NULL_ADDRESS);
          return wethAllowance;
        },
        setAllowance: (currentAddress: string, proxy: string) => setAllowanceForContract(weth, currentAddress, proxy),
        balance: async (address) => {
          return await weth.balanceOf(address);
        }
      },
      'ETH': {
        name: 'ETH',
        logo: 'https://cdn.nft.com/eth.svg',
        contract: NULL_ADDRESS,
        decimals: 18,
        usd: (val: number) => Number(Number(val * ethPriceUSD).toFixed(2)),
        allowance: async () => {
          // ETH doesn't have allowances - just need to include ETH
          // in amount field as payable transaction.
          return 0;
        },
        setAllowance: async () => true,
        balance: async (address) => {
          return await provider?.getBalance(address);
        }
      },
      'DAI': {
        name: 'DAI',
        logo: 'https://cdn.nft.com/dai.svg',
        contract: dai.address,
        usd: (val: number) => val,
        decimals: 18,
        allowance: async (currentAddress: string, proxy: string) => {
          const daiAllowance = await dai.allowance(currentAddress, proxy ?? NULL_ADDRESS);
          return daiAllowance;
        },
        setAllowance: (currentAddress: string, proxy: string) => setAllowanceForContract(dai, currentAddress, proxy),
        balance: async (address) => {
          return await dai.balanceOf(address);
        }
      },
      'USDC': {
        name: 'USDC',
        logo: 'https://cdn.nft.com/usdc.svg',
        contract: usdc.address,
        usd: (val: number) => val,
        decimals: 6,
        allowance: async (currentAddress: string, proxy: string) => {
          const usdcAllowance = await usdc.allowance(currentAddress, proxy ?? NULL_ADDRESS);
          return usdcAllowance;
        },
        setAllowance: (currentAddress: string, proxy: string) => setAllowanceForContract(usdc, currentAddress, proxy),
        balance: async (address) => {
          return await usdc.balanceOf(address);
        }
      }
    };
  }, [
    provider,
    dai,
    ethPriceUSD,
    setAllowanceForContract,
    usdc,
    weth
  ]);

  const getByContractAddress = useCallback((
    contractAddress: string
  ): NFTSupportedCurrency | null => {
    switch(contractAddress?.toLowerCase()) {
    case dai.address.toLowerCase():
      return data.DAI;
    case usdc.address.toLowerCase():
      return data.USDC;
    case weth.address.toLowerCase():
      return data.WETH;
    case NULL_ADDRESS.toLowerCase():
      return data.ETH;
    }
    
    return null;
  }, [dai.address, data.DAI, data.ETH, data.USDC, data.WETH, usdc.address, weth.address]);

  const getBalanceMap = useCallback(async (
    currentAddress: string,
    currencies: SupportedCurrency[]
  ) => {
    const balances = new Map<string, BigNumberish>();
    for (let i = 0; i < currencies.length; i++) {
      const currencyData = data[currencies[i]];
      const balance = await currencyData.balance(currentAddress);
      balances.set(currencyData.contract, balance);
    }
    return balances;
  }, [data]);

  return {
    data,
    getBalanceMap,
    getByContractAddress
  };
}