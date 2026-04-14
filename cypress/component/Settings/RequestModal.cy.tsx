import '../../plugins/tailwind';

/// <reference types="cypress" />
import RequestModal from '../../../components/modules/Settings/RequestModal';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('Request Modal', () => {
  it('should render with basic valid props in initial state', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <RequestModal
          visible
          setVisible={() => null}
          address="0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC"
          transaction='123'
          setAddressVal={() => null}
          submitHandler={() => null}
        />
      </WagmiConfig>
    );
    cy.findByText('Confirm Request').should('exist');
    cy.findByText('You are about to send an address association request to').should('exist');
    cy.findByText('0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC').should('exist');
    cy.findByText('Etherscan').should('have.attr', 'href', 'https://etherscan.io/address/0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC');
    cy.findByText('Please sign the transaction in your wallet. If you have changed your mind and do not wish to send this request, simply cancel.').should('exist');
    cy.get('button').should('not.be.disabled');
  });

  it('should render with basic valid props in pending state', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <RequestModal
          visible
          setVisible={() => null}
          address="0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC"
          transaction='123'
          setAddressVal={() => null}
          submitHandler={() => null}
          isPending
        />
      </WagmiConfig>
    );
    cy.findByText('One second...').should('exist');
    cy.findByText('We\'re waiting for the transaction to complete.').should('exist');
  });

  it('should render with basic valid props in success state', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <RequestModal
          visible
          setVisible={() => null}
          address="0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC"
          transaction='123'
          setAddressVal={() => null}
          submitHandler={() => null}
          success
        />
      </WagmiConfig>
    );
    cy.findByText('Request Sent').should('exist');
    cy.findByText('You have sent an address association request to').should('exist');
    cy.findByText('0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC').should('exist');
    cy.findByText('Etherscan').should('have.attr', 'href', 'https://goerli.etherscan.io/tx/123');
    cy.findByText('Please inform the owner of this address to connect to NFT.com to approve your request. You will receive a notification once approved.').should('exist');
    cy.get('button').should('not.be.disabled');
  });
});