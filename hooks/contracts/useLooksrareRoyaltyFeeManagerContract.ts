import { RoyaltyFeeManager } from 'constants/typechain/looksrare';
import { RoyaltyFeeManager__factory } from 'constants/typechain/looksrare/factories/RoyaltyFeeManager__factory';
import { Maybe } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { Provider } from '@ethersproject/providers';
import { Addresses, addressesByNetwork } from '@looksrare/sdk';
import { useNetwork } from 'wagmi';

export function useLooksrareRoyaltyFeeManagerContractContract(provider: Provider): Maybe<RoyaltyFeeManager> {
  const { chain } = useNetwork();
  const addresses: Addresses = addressesByNetwork[chain?.id];
  const address = addresses?.ROYALTY_FEE_MANAGER;
  if (isNullOrEmpty(address)) {
    return null;
  }
  return RoyaltyFeeManager__factory.connect(address, provider);
}
