import { Nft_resolver } from 'constants/typechain';
import { Nft_resolver__factory } from 'constants/typechain/factories/Nft_resolver__factory';

import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers/lib/ethers';

export function getNftResolverContract(address: string, signer: Signer, provider: Provider): Nft_resolver {
  return Nft_resolver__factory.connect(address, signer ? signer : provider);
}
