import { marketplace } from 'constants/contracts';
import { Marketplace, Marketplace__factory } from 'constants/typechain';

import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';

export function useNftcomExchangeContract(signerOrProvider: Provider | Signer): Marketplace {
  return Marketplace__factory.connect(marketplace.mainnet ,signerOrProvider);
}
