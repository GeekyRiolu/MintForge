import '../../plugins/tailwind';

/// <reference types="cypress" />
import MintProfileSuccessModal from '../../../components/modules/ProfileFactory/MintSuccessModal';
import { useMintSuccessModal }from '../../../hooks/state/useMintSuccessModal';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

const TestComponent = () => {
  const { setMintSuccessModalOpen, mintSuccessModal } = useMintSuccessModal();

  return <div>
    <div id="isOpen">{mintSuccessModal + ''}</div>
    <button id="openButton" onClick={() => setMintSuccessModalOpen(true)}>Open</button>
    <MintProfileSuccessModal />
  </div>;
};

describe('MintSuccessModal', () => {
  const client = setupWagmiClient();
  it('should open and close modal', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <TestComponent />
      </WagmiConfig>
    );
    cy.get('#openButton').click();
    cy.get('#isOpen').should('have.text', 'true');
    cy.findByText('Congratulations!').should('exist');
    cy.findByText('Cheers to your new profile!').should('exist');
    cy.contains('You officially own nft.com/').should('exist');
    cy.findByText('Let’s continue your Web3 journey').should('exist');

    cy.get('.z-10 > path').click().then(() => {
      cy.get('#isOpen').should('have.text', 'false');
    });

    cy.get('#openButton').click();
    cy.contains('Customize your profile').click().then(() => {
      cy.get('#isOpen').should('have.text', 'false');
    });
  });
});