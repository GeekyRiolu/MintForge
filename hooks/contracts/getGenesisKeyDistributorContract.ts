import { Genesis_key_distributor } from 'constants/typechain';
import { Genesis_key_distributor__factory } from 'constants/typechain/factories/Genesis_key_distributor__factory';

import { Provider } from '@ethersproject/providers';

export function getGenesisKeyDistributorContract(
  address: string,
  provider: Provider
): Genesis_key_distributor {
  return Genesis_key_distributor__factory.connect(address, provider);
}