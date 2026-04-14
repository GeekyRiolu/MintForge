import '../plugins/tailwind';

/// <reference types="cypress" />
import AssetTableRow from '../../components/modules/Assets/AssetTableRow';
import { setupWagmiClient } from '../util/utils';

import { WagmiConfig } from 'wagmi';

describe('AddressInput', () => {
  it('should render with valid props and not checked', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <AssetTableRow
          item={{
            contract: '0x98ca78e89Dd1aBE48A53dEe5799F24cC1A462F2D',
            tokenId: '8823',
            metadata: {
              name: 'luc'
            }
          }}
          onChange={() => null}
          isChecked={false}
          
        />
      </WagmiConfig>
    );
    cy.findByText('luc').should('exist');
    cy.get('[type="checkbox"]').should('not.be.checked');
  });

  it('should render with valid props and be checked', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <AssetTableRow
          item={{
            contract: '0x98ca78e89Dd1aBE48A53dEe5799F24cC1A462F2D',
            tokenId: '8824',
            metadata: {
              name: 'robo'
            }
          }}
          onChange={() => null}
          isChecked={true}
          
        />
      </WagmiConfig>
    );
    cy.findByText('robo').should('exist');
    cy.get('[type="checkbox"]').should('be.checked');
  });

  it('dropdown should respond to actions', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <AssetTableRow
          item={{
            contract: '0x98ca78e89Dd1aBE48A53dEe5799F24cC1A462F2D',
            tokenId: '8824',
            metadata: {
              name: 'robo'
            }
          }}
          onChange={() => null}
          isChecked={false}
          
        />
      </WagmiConfig>
    );
    cy.get('[data-cy="RowDropdown"]').click().then(() => {
      cy.findByText('List NFT').should('exist');
      cy.findByText('Share on Twitter').should('exist');
    });
  });
});