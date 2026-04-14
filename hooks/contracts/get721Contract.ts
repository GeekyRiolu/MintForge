import { Erc721 } from 'constants/typechain';
import { Erc721__factory } from 'constants/typechain/factories/Erc721__factory';
import { Maybe } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { Provider } from '@ethersproject/providers';

export function get721Contract(tokenAddress: string, provider: Provider): Maybe<Erc721> {
  if (isNullOrEmpty(tokenAddress)) {
    return null;
  }
  return Erc721__factory.connect(tokenAddress, provider);
}
