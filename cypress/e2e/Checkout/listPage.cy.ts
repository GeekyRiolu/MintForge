/// <reference types="cypress" />

describe('listing checkout page tests', () => {
  beforeEach(() => {
    cy.visit('/app/list');
  });
      
  it('should show an empty listing cart', () => {
    cy.findByText('Opensea').should('exist');
    cy.findByText('Looksrare').should('exist');
    cy.findByText('You haven’t added any listings yet').should('exist');
  });
});
      