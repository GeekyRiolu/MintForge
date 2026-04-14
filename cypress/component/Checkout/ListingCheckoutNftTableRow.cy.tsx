import '../../plugins/tailwind';

import { ListingCheckoutNftTableRow } from '../../../components/modules/Checkout/ListingCheckoutNftTableRow';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('ListingCheckoutNftTableRow', () => {
  const client = setupWagmiClient();

  it('mounts and renders', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <ListingCheckoutNftTableRow
          listing={{
            nft: {
                
            }
          }}
          onPriceChange={() => null}/>
      </WagmiConfig>
    );
  });
/* 
  it('expands and collapses', () => {
    const callback = cy.stub();
    cy.mount(
      <WagmiConfig client={client}>
        <ListingCheckoutNftTableRow
          listing={{ nft: {} }}
          onPriceChange={callback}
        />
      </WagmiConfig>
    );
    cy.get('.caretToggle').first().click().then(() => {
      cy.get('.caretToggle').first().click();
    });
  });

  it('accepts numerical input collapsed', () => {
    const callback = cy.stub();
    cy.mount(
      <WagmiConfig client={client}>
        <ListingCheckoutNftTableRow
          listing={{ nft: {} }}
          onPriceChange={callback}
        />
      </WagmiConfig>
    );
    cy.get('input').type('1').then(() => {
      expect(callback).to.be.called;
    });
  });

  it('accepts numerical input expanded', () => {
    const callback = cy.stub();
    cy.mount(
      <WagmiConfig client={client}>
        <ListingCheckoutNftTableRow
          listing={{ nft: {} }}
          onPriceChange={callback}
        />
      </WagmiConfig>
    );
    cy.get('.caretToggle').first().click().then(() => {
      cy.get('input').first().type('1').then(() => {
        expect(callback).to.be.called;
      });
      cy.get('input').last().type('2');
    });
  });
*/
});