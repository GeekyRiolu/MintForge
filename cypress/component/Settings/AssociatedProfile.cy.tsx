import '../../plugins/tailwind';

/// <reference types="cypress" />
import AssociatedProfile from '../../../components/modules/Settings/AssociatedProfile';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('Associated Profile', () => {
  it('should render with minimum valid props', () => {
    const client = setupWagmiClient();
    const profile = {
      profileUrl: 'lucasgoerli',
      addr: '0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC',
      owner: '0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC',
      url: 'lucasgoerli',
      id: '1'
    };
    cy.mount(
      <WagmiConfig client={client}>
        <AssociatedProfile
          profile={profile}
        />
      </WagmiConfig>
    );
    cy.findByText('0xd1D9F5...f5e3AC').should('exist');
    cy.get('[data-cy="ApprovedProfile"]').trigger('mouseover').then(() => {
      cy.findByText('You have associated your address with this NFT Profile.').should('exist');
    });

    cy.get('[data-cy="ProfileDropdown"]').click().then(() => {
      cy.findByText('Remove').should('exist');
      cy.findByText('View on Etherscan').should('exist');
    });
  });

  it('should render as "pending" with minimum valid props', () => {
    const client = setupWagmiClient();
    const profile = {
      profileUrl: 'lucasgoerli',
      addr: '0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC',
      owner: '0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC',
      url: 'lucasgoerli',
      id: '1'
    };
    cy.mount(
      <WagmiConfig client={client}>
        <AssociatedProfile
          profile={profile}
          pending
        />
      </WagmiConfig>
    );
    cy.findByText('0xd1D9F5...f5e3AC').should('exist');
    cy.get('[data-cy="PendingProfile"]').trigger('mouseover').then(() => {
      cy.findByText('This NFT Profile association is waiting your approval. Click on its name to approve or reject.').should('exist');
    });

    cy.get('[data-cy="ProfileDropdown"]').click().then(() => {
      cy.findByText('Approve').should('exist');
      cy.findByText('Reject').should('exist');
      cy.findByText('View on Etherscan').should('exist');
    });
  });

  it('should render as "removed" with minimum valid props', () => {
    const client = setupWagmiClient();
    const profile = {
      profileUrl: 'lucasgoerli',
      addr: '0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC',
      owner: '0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC',
      url: 'lucasgoerli',
      id: '1'
    };
    cy.mount(
      <WagmiConfig client={client}>
        <AssociatedProfile
          profile={profile}
          isRemoved
        />
      </WagmiConfig>
    );
    cy.findByText('0xd1D9F5...f5e3AC').should('exist');
    cy.get('[data-cy="RemovedProfile"]').trigger('mouseover').then(() => {
      cy.findByText('This NFT Profile has been disassociated from your address. It is safe to remove it from your account.').should('exist');
    });

    cy.get('[data-cy="ProfileDropdown"]').click().then(() => {
      cy.findByText('Remove').should('exist');
      cy.findByText('View on Etherscan').should('exist');
    });
  });

  it('should render as an approved collection with minimum valid props', () => {
    const client = setupWagmiClient();
    const profile = {
      profileUrl: 'lucasgoerli',
      addr: '0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC',
      owner: '0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC',
      url: 'lucasgoerli',
      id: '1'
    };
    cy.mount(
      <WagmiConfig client={client}>
        <AssociatedProfile
          profile={profile}
          isCollection
        />
      </WagmiConfig>
    );
    cy.findByText('0xd1D9F5...f5e3AC').should('exist');
    cy.findByText('lucasgoerli').should('exist');
    cy.get('[data-cy="ApprovedProfile"]').trigger('mouseover').then(() => {
      cy.findByText('You have associated your address with this NFT Profile.').should('exist');
    });
    
    cy.get('[data-cy="ProfileDropdown"]').click().then(() => {
      cy.findByText('Change Collection').should('exist');
    });
  });
});