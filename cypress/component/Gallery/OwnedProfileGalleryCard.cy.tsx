import '../../plugins/tailwind';

import { OwnedProfileGalleryCard } from '../../../components/modules/Gallery/OwnedProfileGalleryCard';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('OwnedProfileGalleryCard', () => {
  const client = setupWagmiClient();

  it('mounts and renders', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <OwnedProfileGalleryCard
          token={{
            contract: {
              address: 'test_contract'
            },
            id: {
              tokenId: 'test_token_id'
            },
            tokenUri: {
              raw: '',
              gateway: ''
            },
            title: 'test owned card',
            metadata: {},
            media: []
          }}
          onClick={() => {
            // todo:
          }} />
      </WagmiConfig>
    );
  });
});