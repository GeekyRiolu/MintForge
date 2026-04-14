/// <reference types="cypress" />

describe('minted profile page tests', () => {
  beforeEach(() => {
    cy.intercept('POST', '*graphql*', req => {
      if (req.body.operationName === 'Profile') {
        req.alias = 'ProfileQuery';
      } else if (req.body.operationName === 'Nft') {
        req.alias = 'NftQuery';
      }
    });
    cy.fixture('minted_profile').then((json) => {
      const profileUrl = json[Cypress.env('NETWORK')]?.['profileUrl'];

      cy.visit('/' + profileUrl);
      cy.wait(1000);

      // cy.wait('@ProfileQuery').its('response.statusCode').should('eq', 200);
      // cy.wait(500); // wait for the children to re-render
    });
  });
    
  it('should show the profile name, metadata, and photos', () => {
    cy.get('#MintedProfileNameContainer').should('contain.text', 'just_toby');
  });

  it('should allow toggling between collection and nft mode', () => {
    cy.get('#NFTCollectionCardContainer').should('not.exist');
    // todo: fix flakiness on GH
    // cy.get('#MintedProfileGalleryCollectionToggle').click();
    // cy.get('.NFTCollectionCardContainer').should('exist');
  });

  it('should not have an announcements link', () => {
    cy.get('#FooterContainer').should('not.contain.text', 'Announcements');
  });
});
    