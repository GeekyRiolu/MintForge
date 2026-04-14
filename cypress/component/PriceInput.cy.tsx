/// <reference types="cypress" />

import '../plugins/tailwind';

import { PriceInput } from '../../components/elements/PriceInput';
import { rainbowDark } from '../../styles/RainbowKitThemes';
import { Doppler, getEnv } from '../../utils/env';
import { setupWagmiClient } from '../util/wagmi';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
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
        url.searchParams.set('chainId', chain?.id.toString());
        return {
          http: url.toString(),
        };
      }
    }),
  ]
);

// TODO: re-enable this test when we can mock the useSupportedCurrencies hook.
xdescribe('PriceInput', () => {
  it('should have the correct placeholder', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <RainbowKitProvider
          appInfo={{
            appName: 'NFT.com',
            learnMoreUrl: 'https://docs.nft.com/',
          }}
          theme={rainbowDark}
          chains={chains}>
          <PriceInput
            currencyAddress="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
            currencyOptions={['ETH', 'WETH']}
            onPriceChange={cy.stub()}
            onCurrencyChange={cy.stub()}
            error={false}
          />
        </RainbowKitProvider>
      </WagmiConfig>
    );
    cy.findByPlaceholderText('e.g. 1 WETH').should('exist');
  });

  it('should call onCurrencyChange', () => {
    const onCurrencyChange = cy.stub();
    cy.mount(
      <PriceInput
        currencyAddress="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        currencyOptions={['ETH', 'WETH']}
        onPriceChange={cy.stub()}
        onCurrencyChange={onCurrencyChange}
        error={false}
      />
    );
    cy.findByText('WETH').click().then(() => {
      cy.findByText('ETH').click().then(() => {
        expect(onCurrencyChange).to.have.been.calledWith('ETH');
      });
    });
  });

  it('should call onPriceChange with valid input', () => {
    const onPriceChange = cy.stub();
    cy.mount(
      <PriceInput
        currencyAddress="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        currencyOptions={['ETH', 'WETH']}
        onPriceChange={onPriceChange}
        onCurrencyChange={cy.stub()}
        error={false}
      />
    );
    cy.findByPlaceholderText('e.g. 1 WETH')
      .click()
      .type('1')
      .then(() => {
        expect(onPriceChange).to.have.been.calledWith(ethers.utils.parseEther('1'));
        cy.findByDisplayValue('1').should('exist');
      });
  });

  it('should call onPriceChange with valid padded zero value', () => {
    const onPriceChange = cy.stub();
    cy.mount(
      <PriceInput
        currencyAddress="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        currencyOptions={['ETH', 'WETH']}
        onPriceChange={onPriceChange}
        onCurrencyChange={cy.stub()}
        error={false}
      />
    );
    cy.findByPlaceholderText('e.g. 1 WETH')
      .click()
      .type('.')
      .then(() => {
        expect(onPriceChange).to.have.been.calledWith(ethers.utils.parseEther('0'));
        cy.findByDisplayValue('0.').should('exist');
      });
  });

  it('should call onPriceChange with valid padded decimal input', () => {
    const onPriceChange = cy.stub();
    cy.mount(
      <PriceInput
        currencyAddress="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        currencyOptions={['ETH', 'WETH']}
        onPriceChange={onPriceChange}
        onCurrencyChange={cy.stub()}
        error={false}
      />
    );
    cy.findByPlaceholderText('e.g. 1 WETH')
      .click()
      .type('.1')
      .then(() => {
        expect(onPriceChange).to.have.been.calledWith(ethers.utils.parseEther('0.1'));
        cy.findByDisplayValue('0.1').should('exist');
      });
  });

  it('should enforce length limit to input', () => {
    const onPriceChange = cy.stub();
    cy.mount(
      <PriceInput
        currencyAddress="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        currencyOptions={['ETH', 'WETH']}
        onPriceChange={onPriceChange}
        onCurrencyChange={cy.stub()}
        error={false}
      />
    );
    cy.findByPlaceholderText('e.g. 1 WETH')
      .click()
      .type('1234567')
      .then(() => {
        expect(onPriceChange).to.have.been.calledWith(ethers.utils.parseEther('123456'));
        cy.findByDisplayValue('123456').should('exist');
      });
  });

  it('should block invalid characters', () => {
    const onPriceChange = cy.stub();
    cy.mount(
      <PriceInput
        currencyAddress="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        currencyOptions={['ETH', 'WETH']}
        onPriceChange={onPriceChange}
        onCurrencyChange={cy.stub()}
        error={false}
      />
    );
    cy.findByPlaceholderText('e.g. 1 WETH')
      .click()
      .type('a')
      .then(() => {
        expect(onPriceChange).not.to.be.called;
        cy.findByPlaceholderText('e.g. 1 WETH').should('exist');
      });
  });
});