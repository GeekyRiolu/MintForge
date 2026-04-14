import { GenesisKeyAuction } from '../../components/modules/GenesisKeyAuction/GenesisKeyAuction';
import { setupWagmiClient } from '../util/utils';

import { WagmiConfig } from 'wagmi';

describe('GenesisKeyAuction', () => {
  const client = setupWagmiClient();

  it('mounts and renders', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <GenesisKeyAuction/>
      </WagmiConfig>
    );
  });
});