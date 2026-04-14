import { LooksRareExchange, LooksRareExchange__factory } from 'constants/typechain/looksrare';
import { Maybe } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { Provider } from '@ethersproject/providers';
import { Addresses, addressesByNetwork } from '@looksrare/sdk';
import { Signer } from 'ethers';
import { useNetwork } from 'wagmi';

export function useLooksrareExchangeContract(signerOrProvider: Provider | Signer): Maybe<LooksRareExchange> {
  const { chain } = useNetwork();
  const addresses: Addresses = addressesByNetwork[chain?.id];
  const address = addresses?.EXCHANGE;
  if (isNullOrEmpty(address) || signerOrProvider == null) {
    return null;
  }
  return LooksRareExchange__factory.connect(address, signerOrProvider);
}
