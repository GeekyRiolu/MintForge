import { LeaderBoard } from '../../components/modules/Profile/LeaderBoard';
import * as data from '../fixtures/leaderboard.json';

describe('NftDetailCard', () => {
  it('mounts rendering column headers and profile name', () => {
    cy.mount(
      <LeaderBoard data={data} />
    );
    cy.contains('Profile').should('exist');
    cy.contains('Items Collected').should('exist');
    cy.contains('Number of NFT Collections').should('exist');
    cy.contains('Number of Genesis Keys').should('exist');
    cy.contains('worldofwomen').should('exist');
  });
});