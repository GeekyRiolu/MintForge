import { Genesis_key_team_claim } from 'constants/typechain';
import { Genesis_key_team_claim__factory } from 'constants/typechain/factories/Genesis_key_team_claim__factory';

import { Provider } from '@ethersproject/providers';
export function getGenesisKeyTeamClaimContract(
  address: string,
  provider: Provider
): Genesis_key_team_claim {
  return Genesis_key_team_claim__factory.connect(address, provider);
}