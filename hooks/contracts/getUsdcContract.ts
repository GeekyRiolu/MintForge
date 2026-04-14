import { Usdc } from 'constants/typechain';
import { Usdc__factory } from 'constants/typechain/factories/Usdc__factory';

import { Provider } from '@ethersproject/providers';
export function getUsdcContract(address: string, provider: Provider): Usdc {
  return Usdc__factory.connect(address, provider);
}
