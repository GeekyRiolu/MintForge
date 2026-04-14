/// <reference types="cypress" />

describe('claim profile page tests', () => {
  beforeEach(() => {
    cy.visit('/app/claim-profiles');
  });
    
  it('should show logged out view with no wallet connected', () => {
    cy.findByText('CONNECT YOUR WALLET').should('exist');
  });
    
  // todo: sign in and test the actual claim page
});