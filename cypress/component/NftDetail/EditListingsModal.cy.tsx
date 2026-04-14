import '../../plugins/tailwind';

import { EditListingsModal } from '../../../components/modules/NFTDetail/EditListingsModal';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('EditListingsModal', () => {
  const client = setupWagmiClient();

  it('mounts and renders', () => {
    const nft = {
      tokenId: 'test_token_id',
      contract: 'test_contract'
    };
    cy.mount(
      <WagmiConfig client={client}>
        <EditListingsModal
          listings={[{
            nft,
          }]}
          nft={nft}
          collectionName={'test_collection'}
          visible={true}
          onClose={() => {
            // todo
          }}
        />
      </WagmiConfig>
    );
  });

  it('mounts and renders and closes', () => {
    const nft = {
      tokenId: 'test_token_id',
      contract: 'test_contract'
    };
    const callback = cy.stub();

    cy.mount(
      <WagmiConfig client={client}>
        <EditListingsModal
          listings={[{
            nft,
          }]}
          nft={nft}
          collectionName={'test_collection'}
          visible={true}
          onClose={callback}
        />
      </WagmiConfig>
    );
    cy.get('.closeButton').first().click().then(() => {
      expect(callback).to.be.called;
    });
  });
});