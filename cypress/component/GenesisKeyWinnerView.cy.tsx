import { AuctionType } from '../../components/modules/GenesisKeyAuction/GenesisKeyAuction';
import { GenesisKeyWinnerView } from '../../components/modules/GenesisKeyAuction/GenesisKeyWinnerView';
import { setupWagmiClient } from '../util/utils';

import { WagmiConfig } from 'wagmi';

describe('GenesisKeyWinnerView', () => {
  const client = setupWagmiClient();

  it('mounts and renders', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <GenesisKeyWinnerView
          ownedTokenID={0}
          claimData={null}
          insiderClaimData={null}
          liveAuction={AuctionType.Blind}
        />
      </WagmiConfig>
    );
  });
});