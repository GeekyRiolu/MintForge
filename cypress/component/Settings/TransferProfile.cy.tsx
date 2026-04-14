import '../../plugins/tailwind';

/// <reference types="cypress" />
import TransferProfile from '../../../components/modules/Settings/TransferProfile';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('Transfer Profile', () => {
  it('should render with basic valid props, and no input', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <TransferProfile
          selectedProfile='lucasgoerli'
        />
      </WagmiConfig>
    );
    cy.get('h2').should('have.text', 'Transfer Profile');
    cy.findByText('Send this profile to another wallet. You will lose access to this profile.').should('exist');
  });

  it('form should update if valid input', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <TransferProfile
          selectedProfile='lucasgoerli'
        />
      </WagmiConfig>
    );
    cy.get('input').type('0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC');
    cy.findByText('Valid wallet address').should('exist');
    cy.get('button').should('not.be.disabled');
  });

  it('form should update if invalid input', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <TransferProfile
          selectedProfile='lucasgoerli'
        />
      </WagmiConfig>
    );
    cy.get('input').type('i love testing');
    cy.findByText('Address is not valid').should('exist');
    cy.get('button').should('be.disabled');
  });
});