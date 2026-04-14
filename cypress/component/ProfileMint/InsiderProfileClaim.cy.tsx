import '../../plugins/tailwind';

import { InsiderProfileClaim } from '../../../components/modules/ProfilePreferences/InsiderProfileClaim';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('InsiderProfileClaim', () => {
  const client = setupWagmiClient();

  it('mounts and renders', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <InsiderProfileClaim />
      </WagmiConfig>
    );
    cy.findAllByText('NFT.com/').first().click();
  });
});