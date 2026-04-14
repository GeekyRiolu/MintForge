import '../../plugins/tailwind';

/// <reference types="cypress" />
import { Notifications } from '../../../components/modules/Sidebar/Notifications';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('Notifications', () => {
  const client = setupWagmiClient();
  it('should render', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <Notifications
          setVisible={() => {
            // todo
          }}
        />
      </WagmiConfig>
    );
  });
});