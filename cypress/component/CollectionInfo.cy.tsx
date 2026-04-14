import '../plugins/tailwind';

import { CollectionInfo } from '../../components/modules/Collection/CollectionInfo';

describe('Collection Info', () => {
  it('mounts with valid statistic data', () => {
    cy.mount(
      <CollectionInfo
        data={{
          floor_price: 1.1,
          one_day_volume: 1.2,
          total_supply: 1.3,
          num_owners: 1.4,
          market_cap: 1.5,
          average_price: 1.6,
          total_volume: 100
        }}
      />
    );
    cy.findByText('Floor').should('exist');
    cy.findByText('1.10 ETH').should('exist');
    cy.findByText('Total Vol').should('exist');
    cy.findByText('100.00 ETH').should('exist');
    cy.findByText('Supply').should('exist');
    cy.findByText('1.3').should('exist');
    cy.findByText('S/O Ratio').should('exist');
    cy.findByText('0.93').should('exist');
    cy.findByText('Market Cap').should('exist');
    cy.findByText('1.50 ETH').should('exist');
    cy.findByText('Average Price').should('exist');
    cy.findByText('1.60 ETH').should('exist');
    cy.findByText('Expand').should('exist');
  });

  it('expands on click', () => {
    cy.mount(
      <CollectionInfo
        data={{
          floor_price: 1.1,
          one_day_volume: 1.2,
          total_supply: 1.3,
          num_owners: 1.4,
          market_cap: 1.5,
          average_price: 1.6,
          total_volume: 100
        }}
      />
    );
    cy.get('[data-cy="collectionInfoExpand"]').click().then(() =>{
      cy.findByText('Collapse').should('exist');
    });
  });

  it('mounts with all valid props + tooltip info', () => {
    cy.mount(
      <CollectionInfo
        data={{
          floor_price: 1.1,
          one_day_volume: 1.2,
          total_supply: 1.3,
          num_owners: 1.4,
          market_cap: 1.5,
          average_price: 1.6,
          total_volume: 100
        }}
        type="ERC721"
        hasDescription
      />

    );
    cy.get('[data-cy="collectionInfoExpand"]').click().then(() =>{
      cy.findByText('ERC721').should('exist');
    });
    cy.get('.floorToolTip').trigger('mouseover').then(() => {
      cy.findByText('Lowest active listing price for a NFT from the collection').should('exist');
    });
  });
});