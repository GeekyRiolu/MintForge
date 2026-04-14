import { Marketplace_event } from 'constants/typechain';
import { Marketplace_event__factory } from 'constants/typechain/factories/Marketplace_event__factory';

import { Provider } from '@ethersproject/providers';

export function getMarketplaceEventContract(address: string, provider: Provider): Marketplace_event {
  return Marketplace_event__factory.connect(address, provider);
}