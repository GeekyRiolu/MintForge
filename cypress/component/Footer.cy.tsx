import '../plugins/tailwind';

import { Footer } from '../../components/elements/Footer';
import { setupWagmiClient } from '../util/wagmi';

import { WagmiConfig } from 'wagmi';

describe('Footer', () => {
  it('mounts with valid props', () => {
    const client = setupWagmiClient();
    cy.viewport(800, 1200).then(() => {
      cy.mount(
        <WagmiConfig client={client}>
          <Footer />
        </WagmiConfig>
      ).then(() => {
        cy.findByText('Learn').should('exist');
        cy.findByText('Gallery').should('exist');
        cy.findByText('Docs').should('exist');
        cy.findByText('Blog').should('exist');
        cy.findByText('Policies').should('exist');
        cy.findByText('Terms of Service').should('exist');
        cy.findByText('Privacy Policy').should('exist');
        cy.findByText('Bug Bounty').should('exist');
        cy.findByText('Resources').should('exist');
        cy.findByText('Support').should('exist');
        cy.findByText('Careers').should('exist');
      });
    });
  });
});