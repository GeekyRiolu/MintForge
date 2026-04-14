import { isNullOrEmpty } from 'utils/format';

import { useSeaportContract } from './contracts/useSeaportContract';

import { BigNumber } from 'ethers';
import useSWR from 'swr';
import { useProvider } from 'wagmi';

export function useSeaportCounter(address: string): string {
  const provider = useProvider();
  const seaport = useSeaportContract(provider);
  const { data } = useSWR('seaportCounter' + address, async () => {
    if (isNullOrEmpty(address)) {
      return BigNumber.from(0);
    }
    return await seaport.getCounter(address);
  });
  return data?.toString();
}
