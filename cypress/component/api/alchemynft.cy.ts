import { genesisKey } from '../../../constants/contracts';
import { CHAIN_ID_TO_NETWORK } from '../../../constants/misc';
import { Doppler, getEnv } from '../../../utils/env';

import { BigNumber } from 'ethers';

describe('alchemy nft API', () => {
  it('should fail on missing action', () => {
    const url = new URL(getEnv(Doppler.NEXT_PUBLIC_BASE_URL) + 'api/alchemynft');
    cy.request({ url: url.toString(), failOnStatusCode: false }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.eq(JSON.stringify({ message: 'Action not recognized' }));
    });
  });

  it('should fail on invalid action', () => {
    const url = new URL(getEnv(Doppler.NEXT_PUBLIC_BASE_URL) + 'api/alchemynft');
    url.searchParams.set('action', 'invalid');
    cy.request({ url: url.toString(), failOnStatusCode: false }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.eq(JSON.stringify({ message: 'Action not recognized' }));
    });
  });

  describe('getNftMetadata', () => {
    it('should respond to valid request', () => {
      const chainId = getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID);
      const url = new URL(getEnv(Doppler.NEXT_PUBLIC_BASE_URL) + 'api/alchemynft');
      url.searchParams.set('contractAddress', genesisKey[CHAIN_ID_TO_NETWORK[Number(chainId)].toLowerCase()]);
      url.searchParams.set('tokenId', BigNumber.from(1).toString());
      url.searchParams.set('tokenType', 'erc721');
      url.searchParams.set('action', 'getNftMetadata');
      url.searchParams.set('chainId', String(chainId));
      cy.request({ url: url.toString(), failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('contract', {
          address: genesisKey[CHAIN_ID_TO_NETWORK[Number(chainId)].toLowerCase()].toLowerCase(),
        });
        expect(response.body).to.have.property('title', 'NFT.com Genesis Key #00001');
        expect(response.body).to.have.deep.property('id', {
          tokenId: '1',
          tokenMetadata: {
            tokenType: 'ERC721',
          }
        });
      });
    });

    it('should respond to invalid request', () => {
      const chainId = getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID);
      const url = new URL(getEnv(Doppler.NEXT_PUBLIC_BASE_URL) + 'api/alchemynft');
      url.searchParams.set('tokenId', BigNumber.from(1).toString());
      url.searchParams.set('tokenType', 'erc721');
      url.searchParams.set('action', 'getNftMetadata');
      url.searchParams.set('chainId', String(chainId));
      cy.request({ url: url.toString(), failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', 'getNftMetadata: Invalid Arguments');
      });
    });

    it('should default to mainnet', () => {
      const url = new URL(getEnv(Doppler.NEXT_PUBLIC_BASE_URL) + 'api/alchemynft');
      url.searchParams.set('contractAddress', genesisKey[CHAIN_ID_TO_NETWORK[1].toLowerCase()]);
      url.searchParams.set('tokenId', BigNumber.from(1).toString());
      url.searchParams.set('tokenType', 'erc721');
      url.searchParams.set('action', 'getNftMetadata');
      cy.request({ url: url.toString(), failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('title', 'NFT.com Genesis Key #00001');
      });
    });
  });

  describe('getNfts', () => {
    it('should respond to valid request', () => {
      const addresses = {
        mainnet: '0x86C8203Fe8F7d60Afaa0bddA4d92cc5abd901578',
        goerli: '0x0f33d6F1d69f87E5494cBfCAC9B9A3619f38Ca09',
      };
      const chainId = getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID);
      const url = new URL(getEnv(Doppler.NEXT_PUBLIC_BASE_URL) + 'api/alchemynft');
      url.searchParams.set('contractAddress', genesisKey[CHAIN_ID_TO_NETWORK[Number(chainId)].toLowerCase()]);
      url.searchParams.set('action', 'getNfts');
      url.searchParams.set('chainId', String(chainId));
      url.searchParams.set('owner', addresses[CHAIN_ID_TO_NETWORK[Number(chainId)].toLowerCase()]);
      cy.request({ url: url.toString(), failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('ownedNfts');
        expect(response.body.ownedNfts[0]).to.have.property('id');
        expect(response.body.ownedNfts[0]).to.have.property('title');
        expect(response.body.ownedNfts[0]).to.have.property('contract');
      });
    });

    it('should not respond to invalid request', () => {
      const chainId = getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID);
      const url = new URL(getEnv(Doppler.NEXT_PUBLIC_BASE_URL) + 'api/alchemynft');
      url.searchParams.set('contractAddress', genesisKey[CHAIN_ID_TO_NETWORK[Number(chainId)].toLowerCase()]);
      url.searchParams.set('action', 'getNfts');
      url.searchParams.set('chainId', String(chainId));
      cy.request({ url: url.toString(), failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.eq(JSON.stringify({ message: 'getNfts: Invalid Arguments' }));
      });
    });
  });

  describe('getNFTsForCollection', () => {
    it('should respond to valid request on mainnet', () => {
      const chainId = '1';
      const url = new URL(getEnv(Doppler.NEXT_PUBLIC_BASE_URL) + 'api/alchemynft');
      url.searchParams.set('contractAddress', genesisKey[CHAIN_ID_TO_NETWORK[Number(chainId)].toLowerCase()]);
      url.searchParams.set('action', 'getNFTsForCollection');
      url.searchParams.set('chainId', String(chainId));
      url.searchParams.set('limit', '3');
      cy.request(url.toString()).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('nfts');
        expect(response.body.nfts).to.have.length(3);
        expect(response.body.nfts[0]).to.have.property('id');
        expect(response.body.nfts[0]).to.have.property('title');
        expect(response.body.nfts[0]).to.have.property('contract');
      });
    });

    it('should not respond to invalid request', () => {
      const url = new URL(getEnv(Doppler.NEXT_PUBLIC_BASE_URL) + 'api/alchemynft');
      url.searchParams.set('action', 'getNFTsForCollection');
      url.searchParams.set('limit', '3');
      cy.request({ url: url.toString(), failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });
});