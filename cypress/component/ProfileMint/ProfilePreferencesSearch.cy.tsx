import '../../plugins/tailwind';

import { ProfilePreferencesSearch } from '../../../components/modules/ProfilePreferences/ProfilePreferencesSearch';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('ProfilePreferencesSearch', () => {
  const client = setupWagmiClient();

  it('mounts and renders', () => {
    cy.mount(
      <WagmiConfig client={client}>
        <ProfilePreferencesSearch />
      </WagmiConfig>
    );
    cy.get('.ProfileNameInput').type('i_am_robot');
  });
});