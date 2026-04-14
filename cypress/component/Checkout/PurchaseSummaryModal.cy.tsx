import '../../plugins/tailwind';

import { PurchaseSummaryModal } from '../../../components/modules/Checkout/PurchaseSummaryModal';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('PurchaseSummaryModal', () => {
  const client = setupWagmiClient();

  it('mounts and renders', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <PurchaseSummaryModal
          visible={true}
          onClose={() => {
            // todo
          }} />
      </WagmiConfig>
    );
  });

  it('mounts and renders and closes', () => {
    const callback = cy.stub();
    cy.mount(
      <WagmiConfig client={client}>
        <PurchaseSummaryModal
          visible={true}
          onClose={callback} />
      </WagmiConfig>
    );
    cy.get('.closeButton').first().click().then(() => {
      expect(callback).to.be.called;
    });
  });

  it('runs the submit button', () => {
    const callback = cy.stub();
    cy.mount(
      <WagmiConfig client={client}>
        <PurchaseSummaryModal
          visible={true}
          onClose={callback} />
      </WagmiConfig>
    );
    cy.findByText('Confirm & Buy').first().click().then(() => {
      cy.findByText('Transaction Failed').should('exist');
      cy.findByText('Cancel').first().click();
    });
  });
});