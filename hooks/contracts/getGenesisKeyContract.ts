import { Genesis_key } from 'constants/typechain';
import { Genesis_key__factory } from 'constants/typechain/factories/Genesis_key__factory';

import { Provider } from '@ethersproject/providers';

export function getGenesisKeyContract(address: string, provider: Provider): Genesis_key {
  return Genesis_key__factory.connect(address, provider);
}
