/// <reference types="cypress" />

describe('activity  page tests', () => {
  beforeEach(() => {
    cy.visit('/app/activity');
  });
  
  it('should redirect to the home page with no wallet connected', () => {
    cy.get('.HomePageContainer').should('exist');
  });

  // todo: test signed-in state with wallet connected
});