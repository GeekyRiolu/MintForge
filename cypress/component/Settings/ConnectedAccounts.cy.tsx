import '../../plugins/tailwind';

/// <reference types="cypress" />
import ConnectedAccounts from '../../../components/modules/Settings/ConnectedAccounts';
import { NULL_ADDRESS } from '../../../constants/addresses';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('Display Mode', () => {
  const client = setupWagmiClient();
  it('should render invalid address message', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <ConnectedAccounts
          selectedProfile={'lucasgoerli'}
          associatedAddresses={{
            pending: [],
            accepted: [],
            denied: []
          }}
        />
      </WagmiConfig>
    );
    cy.get('input').type('bad_input').then(() => {
      cy.findByText('Address is not valid').should('exist');
    }); });

  it('should render success and enable button', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <ConnectedAccounts
          selectedProfile={'lucasgoerli'}
          associatedAddresses={{
            pending: [],
            accepted: [],
            denied: []
          }}
        />
      </WagmiConfig>
    );
    cy.get('input').type(NULL_ADDRESS).then(() => {
      cy.findByText('Valid wallet address').should('exist');
    }); });
});