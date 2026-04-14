import '../../plugins/tailwind';

/// <reference types="cypress" />
import DisplayMode from '../../../components/modules/Settings/DisplayMode';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('Display Mode', () => {
  const client = setupWagmiClient();
  it('should render with basic valid props', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <DisplayMode
          selectedProfile='lucasgoerli'
        />
      </WagmiConfig>
    );
    cy.findByText('Select Display Mode').should('exist');
    cy.findByText('Choose how you plan to use your NFT Profile.').should('exist');
    cy.get('#Gallery').should('be.checked');
  });
});