import '../../plugins/tailwind';

/// <reference types="cypress" />
import SettingsForm from '../../../components/modules/Settings/SettingsForm';
import { setupWagmiClient } from '../../util/utils';

import { WagmiConfig } from 'wagmi';

describe('Settings Form', () => {
  it('should render with basic valid props', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <SettingsForm
          buttonText='Submit'
          inputVal={''}
          changeHandler={() => null}
          submitHandler={() => null}
        />
      </WagmiConfig>
    );
    cy.findByPlaceholderText('0x0000...0000').should('exist');
    cy.findByText('This action will require a').should('exist');
  });

  it('should render with request exists error', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <SettingsForm
          buttonText='Submit'
          inputVal={'0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC'}
          changeHandler={() => null}
          submitHandler={() => null}
          isAssociatedOrPending={true}
        />
      </WagmiConfig>
    );
    cy.findByText('Request exists on chain').should('exist');
  });

  it('should render with address is not valid error', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <SettingsForm
          buttonText='Submit'
          inputVal={'111'}
          changeHandler={() => null}
          submitHandler={() => null}
        />
      </WagmiConfig>
    );
    cy.findByText('Address is not valid').should('exist');
  });

  it('should render with valid address input', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <SettingsForm
          buttonText='Submit'
          inputVal={'0xd1D9F52d63e3736908c6e7D868f785d30Af5e3AC'}
          changeHandler={() => null}
          submitHandler={() => null}
        />
      </WagmiConfig>
    );
    cy.findByText('Valid wallet address').should('exist');
  });
});