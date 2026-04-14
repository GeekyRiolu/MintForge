import '../../plugins/tailwind';

import { CartSidebarNft } from '../../../components/modules/Checkout/CartSidebarNft';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('CartSidebarNft', () => {
  const client = setupWagmiClient();

  it('mounts and renders', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <CartSidebarNft
          item={{
            nft: {
                
            }
          }}
          onRemove={() => null}/>
      </WagmiConfig>
    );
  });
});