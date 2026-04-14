import '../../plugins/tailwind';

import { NFTListingsCartSummaryModal } from '../../../components/modules/Checkout/NFTListingsCartSummaryModal';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('NFTListingsCartSummaryModal', () => {
  const client = setupWagmiClient();

  it('mounts and renders', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <NFTListingsCartSummaryModal
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
        <NFTListingsCartSummaryModal
          visible={true}
          onClose={callback} />
      </WagmiConfig>
    );
    cy.get('.closeButton').first().click().then(() => {
      expect(callback).to.be.called;
    });
  });
});