/// <reference types="cypress" />

describe('auctions  page tests', () => {
  beforeEach(() => {
    cy.visit('/app/auctions');
  });

  // it('should redirect to the GK collections page', () => {
  //   cy.get('.NftCollectionItem').should('exist');
  // });

  // todo: sign in and test the actual auction page
});
