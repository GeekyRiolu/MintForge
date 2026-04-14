import '../../plugins/tailwind';

import MintGKProfileCard from '../../../components/modules/ProfileFactory/MintGKProfileCard';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('MintGKProfileCard', () => {
  const client = setupWagmiClient();

  it('mounts and renders when GK profiles available to mint', () => {
    const onOpen = cy.stub();
    cy.mount(
      <WagmiConfig client={client}>
        <MintGKProfileCard minting={false} setModalOpen={onOpen} setMintingState={onOpen} />
      </WagmiConfig>
    );
    cy.findByText('Claim your free NFT Profile').should('exist');
    cy.findByText('Genesis Key holders receive').should('exist');
    cy.findByText('four free mints!').should('exist');
  });
});
