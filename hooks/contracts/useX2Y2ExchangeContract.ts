import { X2y2_exchange__factory } from 'constants/typechain';
import { X2y2_exchange } from 'constants/typechain';
import { X2Y2_EXCHANGE_CONTRACT } from 'types';

import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';

export function useX2Y2ExchangeContract(signerOrProvider: Provider | Signer): X2y2_exchange {
  return X2y2_exchange__factory.connect(X2Y2_EXCHANGE_CONTRACT ,signerOrProvider);
}
