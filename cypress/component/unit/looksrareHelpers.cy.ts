/// <reference types="cypress" />

import { WETH } from '../../../constants/tokens';
import { createLooksrareParametersForNFTListing } from '../../../utils/looksrareHelpers';
import { convertDurationToSec } from '../../../utils/marketplaceUtils';

import { addressesByNetwork } from '@looksrare/sdk';
import { BigNumber, ethers } from 'ethers';

describe('looksrareHelpers', () => {
  context('createLooksrareParametersForNFTListing', () => {
    it('should create a looksrareParametersForNFTListing', async () => {
      cy.stub(Date, 'now').returns(0);

      // 1bps protocol fee
      const mockStrategy = {
        viewProtocolFee: cy.stub().resolves(BigNumber.from(1))
      };
      // 1bps royalty fee
      const mockFeeRegistry = {
        royaltyFeeInfoCollection: cy.stub().resolves([0, 0, BigNumber.from(1)])
      };
      // 1bps royalty fee
      const mockFeeManager = {
        calculateRoyaltyFeeAndGetRecipient: cy.stub().resolves([0, 0, BigNumber.from(1)])
      };

      const result = await createLooksrareParametersForNFTListing(
        'test_offerer',
        {
          tokenId: '1',
          contract: 'test_collection'
        },
        ethers.utils.parseEther('10'),
        WETH.address,
        1, // chainId
        99, // nonce
        mockStrategy,
        mockFeeRegistry,
        convertDurationToSec('7 Days'),
        mockFeeManager
      );

      expect(result).to.deep.equal({
        amount: '1',
        collection: 'test_collection',
        currency: WETH.address,
        endTime: '604800',
        isOrderAsk: true,
        minPercentageToAsk: 9999, // 1 BPS deducted
        nonce: 99,
        params: [],
        price: ethers.utils.parseEther('10').toString(),
        signer: 'test_offerer',
        startTime: '0',
        strategy: addressesByNetwork[1]?.STRATEGY_STANDARD_SALE,
        tokenId: '1'
      });
    });
  });
});