import '../../plugins/tailwind';

/// <reference types="cypress" />
import NftOwner from '../../../components/modules/Settings/NftOwner';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('Display Mode', () => {
  const client = setupWagmiClient();
  it('should render with basic valid props', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <NftOwner
          selectedProfile='lucasgoerli'
          isSidebar={false}
          showToastOnSuccess={true}
        />
      </WagmiConfig>
    );
  });

  it('should render with basic valid props sidebar', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <NftOwner
          selectedProfile='lucasgoerli'
          isSidebar={true}
          showToastOnSuccess={true}
        />
      </WagmiConfig>
    );
  });
});