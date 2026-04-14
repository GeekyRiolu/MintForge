import '../../plugins/tailwind';

/// <reference types="cypress" />
import AssociatedAddress from '../../../components/modules/Settings/AssociatedAddress';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('Associated Address', () => {
  it('should render with minimum valid props', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <AssociatedAddress
          address='0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC'
          selectedProfile='lucasgoerli'
        />
      </WagmiConfig>
    );
    cy.findByText('0xd1D9F5...f5e3AC').should('exist');
    cy.findByText('Ethereum').should('exist');
    cy.get('[data-cy="ApprovedAssociation"]').trigger('mouseover').then(() => {
      cy.findByText('This address has approved the NFT Profile association.').should('exist');
    });

    cy.get('[data-cy="AssociationDropdown"]').click().then(() => {
      cy.findByText('Remove').should('exist');
      cy.findByText('View on Etherscan').should('exist');
    });
  });

  it('should render as pending with minimum valid props', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <AssociatedAddress
          address='0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC'
          selectedProfile='lucasgoerli'
          pending
        />
      </WagmiConfig>
    );
    cy.findByText('0xd1D9F5...f5e3AC').should('exist');
    cy.findByText('Ethereum').should('exist');
    cy.get('[data-cy="PendingAssociation"]').trigger('mouseover').then(() => {
      cy.findByText('This address association is waiting approval.').should('exist');
    });

    cy.get('[data-cy="AssociationDropdown"]').click().then(() => {
      cy.findByText('Remove').should('exist');
      cy.findByText('View on Etherscan').should('exist');
    });
  });

  it('should render as rejected with minimum valid props', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <AssociatedAddress
          address='0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC'
          selectedProfile='lucasgoerli'
          rejected
        />
      </WagmiConfig>
    );
    cy.findByText('0xd1D9F5...f5e3AC').should('exist');
    cy.findByText('Ethereum').should('exist');
    cy.get('[data-cy="RejectedAssociation"]').trigger('mouseover').then(() => {
      cy.findByText('This address has rejected the association. If this was done in error, please resend the request. No gas is required.').should('exist');
    });

    cy.get('[data-cy="AssociationDropdown"]').click().then(() => {
      cy.findByText('Remove').should('exist');
      cy.findByText('View on Etherscan').should('exist');
      cy.findByText('Resend Request').should('exist');
    });
  });
});