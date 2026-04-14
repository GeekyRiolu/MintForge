/// <reference types="cypress" />

import { NULL_ADDRESS } from '../../../constants/addresses';
import { LooksrareProtocolData, SeaportProtocolData, TxActivity } from '../../../graphql/generated/types';
import { ExternalProtocol, ItemType, OrderType } from '../../../types';
import { getListingCurrencyAddress, getListingPrice, getListingPriceUSD } from '../../../utils/listingUtils';

import { BigNumber, ethers } from 'ethers';
import { PartialDeep } from 'type-fest';

describe('listingUtils', () => {
  context('getListingPrice', () => {
    it('should get the correct opensea listing price', async () => {
      const price = 1000000;
      const mockListing: PartialDeep<TxActivity> = {
        order: {
          protocol: ExternalProtocol.Seaport,
          protocolData: {
            signature: 'test_sig',
            parameters: {
              conduitKey: 'conduitKey',
              consideration: [
                // price
                {
                  endAmount: '975000',
                  identifierOrCriteria: 0,
                  itemType: ItemType.ERC20,
                  recipient: 'test_recipient',
                  startAmount: '975000',
                  token: 'test_token'
                },
                // fee
                {
                  endAmount: '25000',
                  identifierOrCriteria: 'identifierOrCriteria',
                  itemType: ItemType.ERC20,
                  recipient: 'recipient',
                  startAmount: '25000',
                  token: 'token'
                }
              ],
              counter: 0,
              endTime: 'endTime',
              offer: [],
              offerer: 'offerer',
              orderType: OrderType.PARTIAL_OPEN,
              salt: 'salt',
              startTime: 'startTime',
              totalOriginalConsiderationItems: 2,
              zone: 'zone',
              zoneHash: 'zoneHash',
            }
          } as SeaportProtocolData
        }
      };
        
      const result = getListingPrice(mockListing);
  
      expect(result.toString()).to.equal(BigNumber.from(price).toString());
    });

    it('should get the correct looksrare listing price', async () => {
      const price = 1000000;
      const mockListing: PartialDeep<TxActivity> = {
        order: {
          protocol: ExternalProtocol.LooksRare,
          protocolData: {
            amount: '1000000',
            collectionAddress: 'collectionAddress',
            currencyAddress: 'currencyAddress',
            endTime: 'endTime',
            isOrderAsk: true,
            minPercentageToAsk: 'minPercentageToAsk',
            nonce: 'nonce',
            params: 'params',
            price: '1000000',
            r: 'r',
            s: 's',
            signer: 'signer',
            startTime: 'startTime',
            strategy: 'strategy',
            tokenId: 'tokenId',
            v: 'v',
          } as LooksrareProtocolData
        }
      };
          
      const result = getListingPrice(mockListing);
    
      expect(result.toString()).to.equal(BigNumber.from(price).toString());
    });
  });

  describe('getListingPriceUSD' , () => {
    it('should get the correct USD opensea listing price', async () => {
      const mockListing: PartialDeep<TxActivity> = {
        order: {
          protocol: ExternalProtocol.Seaport,
          protocolData: {
            signature: 'test_sig',
            parameters: {
              conduitKey: 'conduitKey',
              consideration: [
                // price
                {
                  endAmount: ethers.utils.parseEther('0.975').toString(),
                  identifierOrCriteria: 0,
                  itemType: ItemType.NATIVE,
                  recipient: 'test_recipient',
                  startAmount: ethers.utils.parseEther('0.975').toString(),
                  token: NULL_ADDRESS
                },
                // fee
                {
                  endAmount: ethers.utils.parseEther('0.025').toString(),
                  identifierOrCriteria: 'identifierOrCriteria',
                  itemType: ItemType.NATIVE,
                  recipient: 'recipient',
                  startAmount: ethers.utils.parseEther('0.025').toString(),
                  token: NULL_ADDRESS
                }
              ],
              counter: 0,
              endTime: 'endTime',
              offer: [],
              offerer: 'offerer',
              orderType: OrderType.PARTIAL_OPEN,
              salt: 'salt',
              startTime: 'startTime',
              totalOriginalConsiderationItems: 2,
              zone: 'zone',
              zoneHash: 'zoneHash',
            }
          } as SeaportProtocolData
        }
      };
          
      const result = getListingPriceUSD(mockListing, 1000, 1);
    
      expect(result).to.equal(1000);
    });
  
    it('should get the correct USD looksrare listing price', async () => {
      const mockListing: PartialDeep<TxActivity> = {
        order: {
          protocol: ExternalProtocol.LooksRare,
          protocolData: {
            amount: '1',
            collectionAddress: 'collectionAddress',
            currencyAddress: NULL_ADDRESS,
            endTime: 'endTime',
            isOrderAsk: true,
            minPercentageToAsk: 'minPercentageToAsk',
            nonce: 'nonce',
            params: 'params',
            price: ethers.utils.parseEther('0.1').toString(),
            r: 'r',
            s: 's',
            signer: 'signer',
            startTime: 'startTime',
            strategy: 'strategy',
            tokenId: 'tokenId',
            v: 'v',
          } as LooksrareProtocolData
        }
      };
            
      const result = getListingPriceUSD(mockListing, 1000, 1);
      
      expect(result).to.equal(100);
    });
  });

  describe('getListingCurrencyAddress', () => {
    it('should get the correct seaport currency address', async () => {
      const mockListing: PartialDeep<TxActivity> = {
        order: {
          protocol: ExternalProtocol.Seaport,
          protocolData: {
            signature: 'test_sig',
            parameters: {
              conduitKey: 'conduitKey',
              consideration: [
                // price
                {
                  endAmount: '975000',
                  identifierOrCriteria: 0,
                  itemType: ItemType.ERC20,
                  recipient: 'test_recipient',
                  startAmount: '975000',
                  token: 'test_token'
                },
                // fee
                {
                  endAmount: '25000',
                  identifierOrCriteria: 'identifierOrCriteria',
                  itemType: ItemType.ERC20,
                  recipient: 'recipient',
                  startAmount: '25000',
                  token: 'token'
                }
              ],
              counter: 0,
              endTime: 'endTime',
              offer: [],
              offerer: 'offerer',
              orderType: OrderType.PARTIAL_OPEN,
              salt: 'salt',
              startTime: 'startTime',
              totalOriginalConsiderationItems: 2,
              zone: 'zone',
              zoneHash: 'zoneHash',
            }
          } as SeaportProtocolData
        }
      };
            
      const result = getListingCurrencyAddress(mockListing);
      
      expect(result).to.equal('test_token');
    });
    
    it('should get the correct looksrare currency address', async () => {
      const mockListing: PartialDeep<TxActivity> = {
        order: {
          protocol: ExternalProtocol.LooksRare,
          protocolData: {
            amount: '1000000',
            collectionAddress: 'collectionAddress',
            currencyAddress: 'currencyAddress',
            endTime: 'endTime',
            isOrderAsk: true,
            minPercentageToAsk: 'minPercentageToAsk',
            nonce: 'nonce',
            params: 'params',
            price: '1000000',
            r: 'r',
            s: 's',
            signer: 'signer',
            startTime: 'startTime',
            strategy: 'strategy',
            tokenId: 'tokenId',
            v: 'v',
          } as LooksrareProtocolData
        }
      };
              
      const result = getListingCurrencyAddress(mockListing);
        
      expect(result).to.equal('currencyAddress');
    });
  });
});