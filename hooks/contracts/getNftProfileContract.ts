import { Nft_profile } from 'constants/typechain';
import { Nft_profile__factory } from 'constants/typechain/factories/Nft_profile__factory';

import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';

export function getNftProfileContract(address: string, provider: Provider, signer?: Signer): Nft_profile {
  return Nft_profile__factory.connect(address, signer ? signer : provider);
}
