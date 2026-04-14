/// <reference types="cypress" />

import '../../plugins/tailwind';

import {
  NFTListingsContext,
  NFTListingsContextProvider,
  NFTListingsContextType
} from '../../../components/modules/Checkout/NFTListingsContext';
import { ExternalProtocol } from '../../../types';
import { setupWagmiClient } from '../../util/wagmi';

import { useContext } from 'react';
import { WagmiConfig } from 'wagmi';

const TestComponent = () => {
  const {
    toList,
    stageListing,
    clear,
    stageListings,
    toggleCartSidebar,
    allListingsConfigured,
    toggleTargetMarketplace,
    setDuration,
    setCurrency,
    clearGeneralConfig,
    getTarget,
    prepareListings
  } = useContext<NFTListingsContextType>(NFTListingsContext);

  const first = {
    nft: {
      chainId: '1',
      contract: 'test_collection_contract',
      id: 'test_nft_id',
      tokenId: 'test_tokenid',
    },
    collectionName: 'Test NFT',
    isApprovedForSeaport: true,
    isApprovedForLooksrare: true,
    targets: []
  };

  const second = {
    nft: {
      chainId: '1',
      contract: 'test_collection_contract',
      id: 'test_nft_id_2',
      tokenId: 'test_tokenid_2',
    },
    collectionName: 'Test NFT',
    isApprovedForSeaport: true,
    isApprovedForLooksrare: true,
    targets: []
  };

  return <div>
    <div id="toList">{JSON.stringify(toList.map((listing) => listing.nft.id))}</div>
    <button onClick={() => {
      stageListing(first);
    }}>Stage Listing</button>
    <button onClick={() => {
      stageListings([
        first, second
      ]);
    }}>Stage Multiple</button>
    <button onClick={clear}>Clear</button>
    <button onClick={() => {
      toggleCartSidebar();
    }}>toggleCartSidebar</button>
    <button onClick={() => {
      allListingsConfigured();
    }}>allListingsConfigured</button>
    <button onClick={() => {
      toggleTargetMarketplace(ExternalProtocol.Seaport, first);
      toggleTargetMarketplace(ExternalProtocol.Seaport, second);
      toggleTargetMarketplace(ExternalProtocol.Seaport);
      toggleTargetMarketplace(ExternalProtocol.LooksRare);
    }}>toggleTargetMarketplace</button>
    <button onClick={() => {
      setDuration('1 Day');
    }}>setDuration</button>
    <button onClick={() => {
      setCurrency(first, 'ETH', ExternalProtocol.Seaport);
    }}>setCurrency</button>
    <button onClick={() => {
      setCurrency(first, 'ETH', ExternalProtocol.Seaport);
      clearGeneralConfig(first);
    }}>clearGeneralConfig</button>
    <button onClick={() => {
      getTarget(first, ExternalProtocol.Seaport);
    }}>getTarget</button>
    <button onClick={() => {
      prepareListings(0);
    }}>prepareListings</button>
  </div>;
};

describe('NFTListingsContextProvider', () => {
  beforeEach(() => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <NFTListingsContextProvider >
          <TestComponent />
        </NFTListingsContextProvider>
      </WagmiConfig>
    );
  });

  it('stages a listing', () => {
    cy.get('#toList').should('contain', '[]');
    cy.get('button').contains('Stage Listing').click();
    cy.get('#toList').should('contain', '["test_nft_id"]');
  });

  it('stages multiple listings', () => {
    cy.get('#toList').should('contain', '[]');
    cy.get('button').contains('Stage Multiple').click();
    cy.get('#toList').should('contain', '["test_nft_id","test_nft_id_2"]');
  });

  it('clears the staged listings', () => {
    cy.get('#toList').should('contain', '[]');
    cy.get('button').contains('Stage Listing').click();
    cy.get('#toList').should('contain', '["test_nft_id"]');
    cy.get('button').contains('Clear').click();
    cy.get('#toList').should('contain', '[]');
  });

  it('toggles the cart sidebar', () => {
    cy.get('button').contains('toggleCartSidebar').click();
  });

  it('runs allListingsConfigured successfully', () => {
    cy.get('button').contains('Stage Listing').click();
    cy.get('button').contains('toggleTargetMarketplace').click();
    cy.get('button').contains('allListingsConfigured').click();
  });

  it('calls toggleTargetMarketplace successfully', () => {
    cy.get('button').contains('toggleTargetMarketplace').click();
  });

  // it('calls setDuration successfully', () => {
  //   cy.get('button').contains('Stage Listing').click();
  //   cy.get('button').contains('toggleTargetMarketplace').click();
  //   cy.get('button').contains('setDuration').click();
  // });

  it('calls setCurrency successfully', () => {
    cy.get('button').contains('Stage Listing').click();
    cy.get('button').contains('setCurrency').click();
  });

  it('calls clearGeneralConfig successfully', () => {
    cy.get('button').contains('clearGeneralConfig').click();
  });

  it('gets the correct target', () => {
    cy.get('button').contains('getTarget').click();
  });

  it('calls prepareListings successfully', () => {
    cy.get('button').contains('prepareListings').click();
  });
});