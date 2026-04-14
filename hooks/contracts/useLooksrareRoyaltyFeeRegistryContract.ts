import { RoyaltyFeeRegistry } from 'constants/typechain/looksrare';
import { RoyaltyFeeRegistry__factory } from 'constants/typechain/looksrare/factories/RoyaltyFeeRegistry__factory';
import { Maybe } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { Provider } from '@ethersproject/providers';
import { Addresses, addressesByNetwork } from '@looksrare/sdk';
import { useNetwork } from 'wagmi';

export function useLooksrareRoyaltyFeeRegistryContractContract(provider: Provider): Maybe<RoyaltyFeeRegistry> {
  const { chain } = useNetwork();
  const addresses: Addresses = addressesByNetwork[chain?.id];
  const address = addresses?.ROYALTY_FEE_REGISTRY;
  if (isNullOrEmpty(address)) {
    return null;
  }
  return RoyaltyFeeRegistry__factory.connect(address, provider);
}
