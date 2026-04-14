import '../../plugins/tailwind';

import { NFTCartSidebar } from '../../../components/modules/Checkout/NFTCartSidebar';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('NFTCartSidebar', () => {
  const client = setupWagmiClient();

  it('mounts and renders', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <NFTCartSidebar
          selectedTab='Buy'
          onChangeTab={() => null}/>
      </WagmiConfig>
    );
  });
});