import { Dai } from 'constants/typechain';
import { Dai__factory } from 'constants/typechain/factories/Dai__factory';

import { Provider } from '@ethersproject/providers';
export function getDaiContract(address: string, provider: Provider): Dai {
  return Dai__factory.connect(address, provider);
}
