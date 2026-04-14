import { KeyClaimVideo } from '../../components/modules/GenesisKeyAuction/KeyClaimVideo';

describe('KeyClaimVideo', () => {
  it('mounts and renders', () => {
    cy.mount(
      <KeyClaimVideo/>
    );
  });
});