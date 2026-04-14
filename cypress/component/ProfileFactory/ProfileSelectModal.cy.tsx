import '../../plugins/tailwind';

/// <reference types="cypress" />
import ProfileSelectModal from '../../../components/modules/ProfileFactory/ProfileSelectModal';
import { useProfileSelectModal }from '../../../hooks/state/useProfileSelectModal';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

const TestComponent = () => {
  const { setProfileSelectModalOpen, profileSelectModal } = useProfileSelectModal();

  return <div>
    <div id="isOpen">{profileSelectModal + ''}</div>
    <button id="openButton" onClick={() => setProfileSelectModalOpen(true)}>Open</button>
    <ProfileSelectModal />
  </div>;
};

describe('ProfileSelectModal', () => {
  const client = setupWagmiClient();
  it('should open and close modal', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <TestComponent />
      </WagmiConfig>
    );
    cy.get('#openButton').click();
    cy.get('#isOpen').should('have.text', 'true');
    cy.findByText('Select NFT Profile').should('exist');
    cy.findByText('Please select your primary NFT Profile').should('exist');
    cy.contains('Minted 0 out of 0 free NFT Profiles').should('exist');
    cy.get('.z-10 > path').click().then(() => {
      cy.get('#isOpen').should('have.text', 'false');
    });
  });
});