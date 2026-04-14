'use client';
import config from 'config/swr.config';

import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SWRConfig } from 'swr';

const CryptoWalletProvider = dynamic(import('./CryptoWalletContext'));
const DndProvider = dynamic(() => import('react-dnd').then(mod => mod.DndProvider));
const GraphQLProvider = dynamic(import('graphql/client/GraphQLProvider'));
const NFTListingsContextProvider = dynamic(import('components/modules/Checkout/NFTListingsContext'));
const NFTPurchaseContextProvider = dynamic(import('components/modules/Checkout/NFTPurchaseContext'));
const NotificationContextProvider = dynamic(import('components/modules/Notifications/NotificationContext'));

const RootProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SWRConfig value={config}>
      <CryptoWalletProvider>
        <AnimatePresence mode="wait">
          <GraphQLProvider>
            <DndProvider backend={HTML5Backend}>
              <NotificationContextProvider>
                <NFTPurchaseContextProvider>
                  <NFTListingsContextProvider>
                    {children}
                  </NFTListingsContextProvider>
                </NFTPurchaseContextProvider>
              </NotificationContextProvider>
            </DndProvider>
          </GraphQLProvider>
        </AnimatePresence>
      </CryptoWalletProvider>
    </SWRConfig>
  );
};

export default RootProvider;
