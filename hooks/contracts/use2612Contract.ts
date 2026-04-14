import { Eip_2612 } from 'constants/typechain';
import { Eip_2612__factory } from 'constants/typechain/factories/Eip_2612__factory';

import { Provider } from '@ethersproject/providers';

export function useEIP2612Contract(tokenAddress: string, provider: Provider): Eip_2612 {
  return Eip_2612__factory.connect(tokenAddress, provider);
}
