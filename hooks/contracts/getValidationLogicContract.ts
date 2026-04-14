import { Validation_logic } from 'constants/typechain';
import { Validation_logic__factory } from 'constants/typechain/factories/Validation_logic__factory';

import { Provider } from '@ethersproject/providers';

export function getValidationLogicContract(address: string, provider: Provider): Validation_logic {
  return Validation_logic__factory.connect(address, provider);
}