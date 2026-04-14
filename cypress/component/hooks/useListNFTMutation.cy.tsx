/// <reference types="cypress" />

import { GraphQLProvider } from '../../../graphql/client/GraphQLProvider';
import { useListNFTMutations } from '../../../graphql/hooks/useListNFTMutation';
import { rainbowDark } from '../../../styles/RainbowKitThemes';
import { OrderType } from '../../../types';
import { Doppler, getEnv } from '../../../utils/env';
import { getSigners, setupWagmiClient } from '../../util/utils';

import { JsonRpcSigner } from '@ethersproject/providers';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { MockConnector } from '@wagmi/core/connectors/mock';
import { configureChains, WagmiConfig } from 'wagmi';
import { goerli, mainnet } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const { chains } = configureChains(
  getEnv(Doppler.NEXT_PUBLIC_ENV) !== 'PRODUCTION' ?
    [mainnet, goerli] :
    [mainnet],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        const url = new URL(getEnv(Doppler.NEXT_PUBLIC_BASE_URL) + 'api/ethrpc');
        url.searchParams.set('chainId', String(chain?.id));
        return {
          http: url.toString(),
        };
      }
    }),
  ]
);

const TestComponent = () => {
  const { listNftSeaport, listNftLooksrare } = useListNFTMutations();
  return <div>
    <button onClick={() => {
      listNftSeaport('test_seaport', {
        counter: 'test_counter',
        offerer: 'test_offerer',
        zone: 'test_zone',
        orderType: OrderType.FULL_OPEN,
        startTime: 'test_startTime',
        endTime: 'test_endTime',
        zoneHash: 'test_zoneHash',
        salt: 'test_salt',
        offer: [{
          itemType: 2,
          token: 'test_offer_token',
          identifierOrCriteria: 'test_offer_id',
          startAmount: 'test_offer_startAmount',
          endAmount: 'test_offer_endAmount',
        }],
        consideration: [{
          itemType: 0,
          token: 'test_consideration_token',
          identifierOrCriteria: 'test_consideration_id',
          startAmount: 'test_consideration_startAmount',
          endAmount: 'test_consideration_endAmount',
          recipient: 'test_consideration_recipient',
        }],
        totalOriginalConsiderationItems: 'test_totalOriginalConsiderationItems',
        conduitKey: 'test_conduitKey',
      });
    }}>listSeaport</button>
    <button onClick={() => {
      listNftLooksrare({
        signature: 'test_signature',
        isOrderAsk: true,
        signer: 'test_signer',
        collection: 'test_collection',
        price: 'test_price',
        tokenId: 'test_tokenId',
        amount: 'test_amount',
        strategy: 'test_strategy',
        currency: 'test_currency',
        nonce: 'test_nonce',
        startTime: 'test_startTime',
        endTime: 'test_endTime',
        minPercentageToAsk: 'test_minPercentageToAsk',
        params: []
      });
    }}>listLooksrare</button>
  </div>;
};

describe('useListNFTMutations', () => {
  let connector: MockConnector;
  let signer: JsonRpcSigner;
  beforeEach(() => {
    cy.intercept('POST', '*graphql*', req => {
      if (req.body.operationName === 'ListNftSeaport') {
        req.alias = 'ListNftSeaport';
      } else if (req.body.operationName === 'ListNftLooksrare') {
        req.alias = 'ListNftLooksrare';
      }
    }).then(() => {
      const signers = getSigners();
      signer = signers[0];
      connector = new MockConnector({
        options: { signer },
      });
      const client = setupWagmiClient({}, [connector]);
      cy.mount(
        <WagmiConfig client={client}>
          <RainbowKitProvider
            appInfo={{
              appName: 'NFT.com',
              learnMoreUrl: 'https://docs.nft.com/',
            }}
            theme={rainbowDark}
            chains={chains}>
            <GraphQLProvider>
              <TestComponent />
            </GraphQLProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      );
    });
  });

  context('listNftSeaport', () => {
    it('should send the expected network request', () => {
      cy.get('button').contains('listSeaport').click().then(() => {
        cy.wait('@ListNftSeaport');
      });
    });
  });

  context('listNftLooksrare', () => {
    it('should send the expected network request', () => {
      cy.get('button').contains('listLooksrare').click().then(() => {
        cy.wait('@ListNftLooksrare');
      });
    });
  });
});