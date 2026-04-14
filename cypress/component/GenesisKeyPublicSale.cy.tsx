import { GenesisKeyPublicSale } from '../../components/modules/GenesisKeyAuction/GenesisKeyPublicSale';
import { setupWagmiClient } from '../util/utils';

import { BigNumber } from 'ethers';
import { WagmiConfig } from 'wagmi';

describe('GenesisKeyPublicSale', () => {
  const client = setupWagmiClient();

  it('mounts and renders', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <GenesisKeyPublicSale currentPrice={BigNumber.from('10000000')}/>
      </WagmiConfig>
    );
  });
});