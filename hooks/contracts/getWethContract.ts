import { Weth } from 'constants/typechain';
import { Weth__factory } from 'constants/typechain/factories/Weth__factory';

import { Provider } from '@ethersproject/providers';
export function getWethContract(address: string, provider: Provider): Weth {
  return Weth__factory.connect(address, provider);
}
