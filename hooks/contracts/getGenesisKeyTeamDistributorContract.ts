import { Genesis_key_team_distributor } from 'constants/typechain';
import { Genesis_key_team_distributor__factory } from 'constants/typechain/factories/Genesis_key_team_distributor__factory';

import { Provider } from '@ethersproject/providers';

export function getGenesisKeyTeamDistributorContract(
  address: string,
  provider: Provider
): Genesis_key_team_distributor {
  return Genesis_key_team_distributor__factory.connect(address, provider);
}