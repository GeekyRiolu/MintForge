import '../../plugins/tailwind';

import MintFreeProfileCard from '../../../components/modules/ProfileFactory/MintFreeProfileCard';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('MintFreeProfileCard', () => {
  const client = setupWagmiClient();

  it('mounts and renders when free profile available', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <MintFreeProfileCard />
      </WagmiConfig>
    );
    cy.findByText('Claim your free NFT Profile').should('exist');
    cy.findByText('Every wallet receives').should('exist');
    cy.get('input').type('testProfile').then(() => {
      cy.findByText('Great! Profile name is available :)').should('exist');
      cy.get('button').should('not.be.disabled');
    });
  });
});
