import { Nft_token } from 'constants/typechain';
import { Nft_token__factory } from 'constants/typechain/factories/Nft_token__factory';

import { Provider } from '@ethersproject/providers';

export function getNftTokenContract(address: string, provider: Provider): Nft_token {
  return Nft_token__factory.connect(address, provider);
}
