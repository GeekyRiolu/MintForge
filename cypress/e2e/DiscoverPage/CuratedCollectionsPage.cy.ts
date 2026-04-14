/// <reference types="cypress" />

describe('discover page tests', () => {
  beforeEach(() => {
    cy.intercept('POST', '*graphql*', req => {
      if (req.body.operationName === 'NftsForCollections') {
        req.alias = 'NftsForCollectionsQuery';
      }
    });
    cy.fixture('curated_collections_results').then((json) => {
      cy.visit('/app/discover');

      cy.wait('@NftsForCollectionsQuery').its('response.statusCode').should('eq', 200);
      cy.wait(500);
    });
  });
  
  // it('renders curated tabs', () => {
  //   cy.fixture('curated_collections_results').then((json) => {
  //     cy.contains('/PFPs').should('exist');
  //     cy.contains('/Famous').should('exist');
  //     cy.contains('/Utility').should('exist');
  //     cy.contains('NFT.com').should('exist');
  //   });
  // });
});
  