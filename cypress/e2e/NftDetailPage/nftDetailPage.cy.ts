/// <reference types="cypress" />

describe('nft detail page tests', () => {
  beforeEach(() => {
    cy.intercept('POST', '*graphql*', req => {
      if (req.body.operationName === 'RefreshNft') {
        req.alias = 'refreshNftMutation';
      } else if (req.body.operationName === 'Nft') {
        req.alias = 'NftQuery';
      } else if (req.body.operationName === 'Activities') {
        req.alias = 'activitiesQuery';
      }
    });
    cy.fixture('nft_details').then((json) => {
      const contract = json[Cypress.env('NETWORK')]?.['contract'];
      const tokenId = json[Cypress.env('NETWORK')]?.['tokenId'];
      cy.visit('/app/nft/' + contract + '/' + tokenId);
      cy.wait(1000);
      // cy.wait('@NftQuery').its('response.statusCode').should('eq', 200);
      // cy.wait(500); // wait for the children to re-render with nft data
    });
  });
  
  it('displays title and owner', () => {
    cy.fixture('nft_details').then(() => {
      cy.get('#NFTDetailContainer').should('exist');

      // todo: fix flakiness on GH
      // const expectedName = json[Cypress.env('NETWORK')]?.['expectedName'];
      // cy.get('#NFTDetailContainer').contains(expectedName);
    });
  });
  
  it('all sections are visible on load', () => {
    cy.get('#NFTDescriptionContainer').should('exist');
    cy.get('#NftChainInfoContainer').should('exist');
  });

  // todo: fix flakiness on GH
  xit('all 4 Chain Info items are displayed', () => {
    cy.fixture('nft_details').then((json) => {
      cy.get('#NftChainInfoContainer').should('exist');
      const contract = json[Cypress.env('NETWORK')]?.['contract'];
      const tokenId = json[Cypress.env('NETWORK')]?.['tokenId'];
      cy.get(':nth-child(1) > .justify-end').should('include.text', contract.substring(Math.max(String(contract).length - 6, 0)));
      cy.get(':nth-child(2) > .justify-end').should('include.text', tokenId);
      cy.get(':nth-child(3) > .justify-end').should('include.text', 'ERC721');
      cy.get(':nth-child(4) > .justify-end').should('include.text', 'ETH');
    });
  });

  // TODO: re-enable when traits are visible on goerli
  xit('should toggle properties successfully', () => {
    cy.get('#NftPropertiesContainer .NftDetailCard').should('have.length', 8);
    cy.get('#NftPropertiesContainer .nftDetailToggle').click();
    cy.get('#NftPropertiesContainer .NftDetailCard').should('not.exist');
  });

  xit('should be rate limited for nft data refresh', () => {
    cy.get('#refreshNftButton').should('exist').scrollIntoView().then(() => {
      cy.get('#refreshNftButton').click().then(() => {
        cy.wait('@refreshNftMutation').its('response.body.errors').should('not.exist');
        cy.wait(500).then(() => {
          cy.get('#refreshNftButton').click().then(() => {
            cy.wait('@refreshNftMutation').its('response.body.errors').should('have.length', 1);
            // wait 6 seconds for rate limit to expire
            cy.wait(6000).then(() => {
              cy.get('#refreshNftButton').click();
              cy.wait('@refreshNftMutation').its('response.body.errors').should('not.exist');
            });
          });
        });
      });
    });
  });
});
  