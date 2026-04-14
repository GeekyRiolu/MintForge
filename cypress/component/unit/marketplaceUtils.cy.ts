/// <reference types="cypress" />

import { NULL_ADDRESS } from '../../../constants/addresses';
import { ExternalProtocol } from '../../../types';
import { convertDurationToSec, getMaxMarketplaceFeesUSD, getMaxRoyaltyFeesUSD, getTotalFormattedPriceUSD, getTotalMarketplaceFeesUSD, getTotalRoyaltiesUSD, hasSufficientBalances, needsERC20Approvals } from '../../../utils/marketplaceUtils';

import { BigNumber, BigNumberish } from 'ethers';
  
describe('Unit test our marketplace helper functions', () => {
  context('convertDurationToSec', () => {
    it('should return the correct number of seconds', () => {
      expect(convertDurationToSec('1 Hour')).to.equal(60 * 60 * 1);
      expect(convertDurationToSec('1 Day')).to.equal(60 * 60 * 24);
      expect(convertDurationToSec('7 Days')).to.equal(60 * 60 * 24 * 7);
      expect(convertDurationToSec('30 Days')).to.equal(60 * 60 * 24 * 30);
      expect(convertDurationToSec('60 Days')).to.equal(60 * 60 * 24 * 60);
      expect(convertDurationToSec('90 Days')).to.equal(60 * 60 * 24 * 3 * 30);
      expect(convertDurationToSec('180 Days')).to.equal(60 * 60 * 24 * 6 * 30);
    });
  });

  context('needsApprovals', () => {
    it('should return true', () => {
      const toBuy = [
        {
          currency: 'test_currency',
          isApproved: false
        }
      ];
      expect(needsERC20Approvals(toBuy)).to.be.true;
    });

    it('should return true with duplicate currency', () => {
      const toBuy = [
        {
          currency: 'test_currency',
          isApproved: false
        },
        {
          currency: 'test_currency',
          isApproved: true
        }
      ];
      expect(needsERC20Approvals(toBuy)).to.be.true;
    });

    it('should return false with one currency approved', () => {
      const toBuy = [
        {
          currency: 'test_currency',
          isERC20ApprovedForAggregator: true
        },
        {
          currency: 'test_currency',
          isERC20ApprovedForAggregator: true
        }
      ];
      expect(needsERC20Approvals(toBuy)).to.be.false;
    });

    it('should return false with all currencies approved', () => {
      const toBuy = [
        {
          currency: 'test_currency',
          isERC20ApprovedForAggregator: true
        },
        {
          currency: 'test_currency2',
          isERC20ApprovedForAggregator: true
        }
      ];
      expect(needsERC20Approvals(toBuy)).to.be.false;
    });

    it('should return false for native currency', () => {
      const toBuy = [
        {
          currency: NULL_ADDRESS,
          isERC20ApprovedForAggregator: false
        },
      ];
      expect(needsERC20Approvals(toBuy)).to.be.false;
    });
  });

  context('hasSufficientBalances', () => {
    it('should return false for one currency', () => {
      const balances = new Map<string, BigNumberish>();
      balances.set('test_currency', 10);
      expect(hasSufficientBalances([
        {
          currency: 'test_currency',
          price: 11
        }
      ], balances)).to.be.false;
    });

    it('should return true for one currency', () => {
      const balances = new Map<string, BigNumberish>();
      balances.set('test_currency', 10);
      expect(hasSufficientBalances([
        {
          currency: 'test_currency',
          price: 9
        }
      ], balances)).to.be.true;
    });

    it('should return false for two currencies', () => {
      const balances = new Map<string, BigNumberish>();
      balances.set('test_currency', 10);
      expect(hasSufficientBalances([
        {
          currency: 'test_currency',
          price: 11
        },
        {
          currency: 'second_currency',
          price: 5
        }
      ], balances)).to.be.false;
    });

    it('should return true for two currencies', () => {
      const balances = new Map<string, BigNumberish>();
      balances.set('test_currency', 10);
      balances.set('second_currency', 10);
      expect(hasSufficientBalances([
        {
          currency: 'test_currency',
          price: 9
        },
        {
          currency: 'second_currency',
          price: 9
        }
      ], balances)).to.be.true;
    });
  });

  context('getTotalFormattedPriceUSD', () => {
    it('should return the correct string', () => {
      expect(getTotalFormattedPriceUSD([
        {
          currency: 'test_currency',
          price: BigNumber.from('12340000000000000000')
        }
      ],
      () => ({
        decimals: 18,
        usd: (val: number) => val
      }))).to.equal('12.34');
    });
  });

  context('getTotalMarketplaceFeesUSD', () => {
    it('should return the correct seaport fee', () => {
      expect(getTotalMarketplaceFeesUSD(
        [
          {
            price: BigNumber.from('10000000000000000000000000'),
            currency: 'test_currency',
            protocol: ExternalProtocol.Seaport
          }
        ],
        BigNumber.from('100'),
        () => ({
          decimals: 18,
          usd: (val: number) => val
        }),
        false
      )).to.equal(250000);
    });

    it('should return the correct looksrare fee', () => {
      expect(getTotalMarketplaceFeesUSD(
        [
          {
            price: BigNumber.from('10000000000000000000000000'),
            currency: 'test_currency',
            protocol: ExternalProtocol.LooksRare
          }
        ],
        BigNumber.from('100'),
        () => ({
          decimals: 18,
          usd: (val: number) => val
        }),
        false
      )).to.equal(100000);
    });

    it('should return the correct combined fees', () => {
      expect(getTotalMarketplaceFeesUSD(
        [
          {
            price: BigNumber.from('10000000000000000000000000'),
            currency: 'test_currency',
            protocol: ExternalProtocol.LooksRare
          },
          {
            price: BigNumber.from('10000000000000000000000000'),
            currency: 'test_currency',
            protocol: ExternalProtocol.Seaport
          }
        ],
        BigNumber.from('100'),
        () => ({
          decimals: 18,
          usd: (val: number) => val
        }),
        false
      )).to.equal(350000);
    });
  });

  context('getTotalRoyaltiesUSD', () => {
    it('should return the correct seaport royalties', () => {
      expect(getTotalRoyaltiesUSD(
        [
          {
            price: BigNumber.from('1000000000000000000000000'),
            currency: 'test_currency',
            protocol: ExternalProtocol.Seaport,
            protocolData: {
              parameters: {
                consideration: [
                  {}, // price
                  {}, // marketplace fee
                  {
                    startAmount: BigNumber.from('100000000000000000')
                  }
                ]
              }
            }
          }
        ],
        BigNumber.from('100'),
        () => ({
          decimals: 18,
          usd: (val: number) => val
        }),
        [0]
      )).to.equal(0.1);
    });

    it('should return the correct looksrare royalties', () => {
      expect(getTotalRoyaltiesUSD(
        [
          {
            price: BigNumber.from('100000000000000000000'),
            currency: 'test_currency',
            protocol: ExternalProtocol.LooksRare,
            protocolData: {
              minPercentageToAsk: 9800,
              price: '100000000000000000000'
            }
          }
        ],
        BigNumber.from('1000'),
        () => ({
          decimals: 18,
          usd: (val: number) => val
        }),
        [0]
      )).to.equal(88);
    });

    it('should return the correct combined royalties', () => {
      expect(getTotalRoyaltiesUSD(
        [
          {
            price: BigNumber.from('100000000000000000000'),
            currency: 'test_currency',
            protocol: ExternalProtocol.LooksRare,
            protocolData: {
              minPercentageToAsk: 9800,
              price: '100000000000000000000'
            }
          },
          {
            price: BigNumber.from('1000000000000000000000000'),
            currency: 'test_currency',
            protocol: ExternalProtocol.Seaport,
            protocolData: {
              parameters: {
                consideration: [
                  {}, // price
                  {}, // marketplace fee
                  {
                    startAmount: BigNumber.from('100000000000000000')
                  }
                ]
              }
            }
          }
        ],
        BigNumber.from('1000'),
        () => ({
          decimals: 18,
          usd: (val: number) => val
        }),
        [0]
      )).to.equal(88.1);
    });
  });

  context('getMaxMarketplaceFeesUSD' , () => {
    it('should return the max total fees', () => {
      expect(getMaxMarketplaceFeesUSD(
        [
          {
            // first nft
            startingPrice: BigNumber.from('100000000000000000000'),
            currency: 'test_currency',
            targets: [{
              protocol: ExternalProtocol.LooksRare,
            }]
          },
          {
            // second nft 
            startingPrice: BigNumber.from('1000000000000000000000000'),
            currency: 'test_currency',
            targets: [{
              protocol: ExternalProtocol.Seaport,
            }]
          }
        ],
        BigNumber.from('1000'),
        () => ({
          decimals: 18,
          usd: (val: number) => val
        }),
        0,
        false
      )).to.equal(25010);
    });
  });

  context('getMaxRoyaltyFeesUSD', () => {
    it('should return the correct max total fees', () => {
      expect(getMaxRoyaltyFeesUSD(
        [
          {
            // first nft
            startingPrice: BigNumber.from('1000000000000000000000000'),
            currency: 'test_currency',
            targets: [{
              protocol: ExternalProtocol.LooksRare,
              looksrareOrder: {
                minPercentageToAsk: 9000,
                price: '1000000000000000000000000'
              }
            }]
          },
          {
            // second nft 
            startingPrice: BigNumber.from('1000000000000000000000000'),
            currency: 'test_currency',
            targets: [{
              protocol: ExternalProtocol.Seaport,
              seaportParameters: {
                consideration: [
                  {}, // price
                  {}, // marketplace fee
                  {
                    startAmount: '1000000000000' // royalty
                  }
                ]
              }
            }]
          }
        ],
        BigNumber.from('100'),
        () => ({
          decimals: 18,
          usd: (val: number) => val
        }),
        [0],
        [0]
      )).to.equal(0.000001);
    });
  });
});