import '../../plugins/tailwind';

import ExternalListingTile, { ListingButtonType } from '../../../components/modules/NFTDetail/ExternalListingTile';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('ExternalListingTile', () => {
  const client = setupWagmiClient();

  it('mounts and renders with Cancel button', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <ExternalListingTile
          listing={{
            nft: {}
          }}
          nft={{}}
          collectionName="test_collection"
          buttons={[
            ListingButtonType.Cancel
          ]}
        />
      </WagmiConfig>
    );
  });

  it('mounts and renders with Adjust button', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <ExternalListingTile
          listing={{
            nft: {}
          }}
          nft={{}}
          collectionName="test_collection"
          buttons={[
            ListingButtonType.Adjust
          ]}
        />
      </WagmiConfig>
    );
  });

  it('mounts and renders with AddToCart button', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <ExternalListingTile
          listing={{
            nft: {}
          }}
          nft={{}}
          collectionName="test_collection"
          buttons={[
            ListingButtonType.AddToCart
          ]}
        />
      </WagmiConfig>
    );
  });
});