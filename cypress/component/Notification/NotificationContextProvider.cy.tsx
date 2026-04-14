/// <reference types="cypress" />

import '../../plugins/tailwind';

import {
  NotificationContext,
  NotificationContextProvider,
  NotificationContextType
} from '../../../components/modules/Notifications/NotificationContext';
import { setupWagmiClient } from '../../util/wagmi';

import { useContext } from 'react';
import { WagmiConfig } from 'wagmi';

const TestComponent = () => {
  const {
    count,
    // todo
  } = useContext<NotificationContextType>(NotificationContext);

  return <div>
    <div id="countDiv">{count}</div>
    {/* todo: test context functionality */}
  </div>;
};

describe('NotificationContextProvider', () => {
  it('should render', () => {
    const client = setupWagmiClient();
    cy.mount(
      <WagmiConfig client={client}>
        <NotificationContextProvider >
          <TestComponent />
        </NotificationContextProvider>
      </WagmiConfig>
    );
  });
});