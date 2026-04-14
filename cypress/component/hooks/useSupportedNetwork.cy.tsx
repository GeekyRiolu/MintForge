/// <reference types="cypress" />

import { useSupportedNetwork } from '../../../hooks/useSupportedNetwork';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

const TestComponent = () => {
  const { isSupported, supportedNetworks } = useSupportedNetwork();

  return <div>
    <div id="isSupported">{isSupported + ''}</div>
    <div id="networks">{JSON.stringify(supportedNetworks)}</div>
  </div>;
};

describe('useSupportedNetwork', () => {
  it('should have the correct networks', () => {
    const client = setupWagmiClient();

    cy.mount(
      <WagmiConfig client={client}>
        <TestComponent />
      </WagmiConfig>
    );
    cy.get('#isSupported').should('have.text', 'false');
    cy.get('#networks').should('have.text', '["ethereum:5:goerli"]');
  });
});