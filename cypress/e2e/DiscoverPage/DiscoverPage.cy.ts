/// <reference types="cypress" />

describe('discover page tests mobile', () => {
  beforeEach(() => {
    cy.viewport(550, 750);
    cy.visit('/app/discover/');
  });

  // TODO (fernando): complete test
  it('renders first 2 items', () => {
    cy.contains('Discover').should('exist');
    // cy.get('.DiscoverCollectionItem').should('have.length', 2);
  });

  // TODO (fernando): complete test
  xit('renders next 2 items after clicking load more button', () => {
    cy.findByText('Load More').should('exist').click().then(() =>{
      cy.get('.DiscoverCollectionItem').should('have.length', 4);
    });
  });
});

describe('discover page tests tablet', () => {
  beforeEach(() => {
    cy.viewport(820, 1180);
    cy.visit('/app/discover/');
  });

  // TODO (fernando): complete test
  it('renders first 4 items', () => {
    cy.contains('Discover').should('exist');
    // cy.get('.DiscoverCollectionItem').should('have.length', 4);
  });

  // TODO (fernando): complete test
  xit('renders next 4 items after clicking load more button', () => {
    cy.findByText('Load More').should('exist').click().then(() =>{
      cy.get('.DiscoverCollectionItem').should('have.length', 8);
    });
  });
});

describe('discover page tests laptop', () => {
  beforeEach(() => {
    cy.viewport(1024, 1915);
    cy.visit('/app/discover/');
  });

  // TODO (fernando): complete test
  it('renders first 6 items', () => {
    cy.contains('Discover').should('exist');
    // cy.get('.DiscoverCollectionItem').should('have.length', 6);
  });

  // TODO (fernando): complete test
  xit('renders next 6 items after clicking load more button', () => {
    cy.findByText('Load More').should('exist').click().then(() =>{
      cy.get('.DiscoverCollectionItem').should('have.length', 12);
    });
  });
});
    