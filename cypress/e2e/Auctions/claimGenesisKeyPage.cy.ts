/// <reference types="cypress" />

describe('claim GK page tests', () => {
  beforeEach(() => {
    cy.visit('/app/claim-genesis-key');
  });

  it('should redirect to the GK collections page', () => {
    cy.findByText('CONNECT YOUR WALLET').should('exist');
  });

  // todo: sign in and test the actual claim page
});
