import { Profile_auction } from 'constants/typechain';
import { Profile_auction__factory } from 'constants/typechain/factories/Profile_auction__factory';

import { Provider } from '@ethersproject/providers';

export function getProfileAuctionContract(address: string, provider: Provider): Profile_auction {
  return Profile_auction__factory.connect(address, provider);
}
