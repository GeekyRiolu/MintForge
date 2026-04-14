import { Nft_aggregator__factory } from 'constants/typechain/factories/Nft_aggregator__factory';
import { Nft_aggregator } from 'constants/typechain/Nft_aggregator';

import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers/lib/ethers';

export function getNftAggregatorContract(address: string, signerOrProvider: Signer | Provider): Nft_aggregator {
  return Nft_aggregator__factory.connect(address, signerOrProvider);
}
