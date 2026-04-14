/// <reference types="cypress" />

describe('Mint Profiles Page', () => {
  it('Navigates to mint profiles page when no profile/wallet connected', () => {
    cy.visit('/app/mint-profiles');
    cy.wait(5000);
    cy.url().should('not.eq', '/app/mint-profiles');
  });
});