'use client';
import config from 'config/swr.config';

import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SWRConfig } from 'swr';

const CryptoWalletProvider = dynamic(() => import('./CryptoWalletContext'), { ssr: false });
const AuthProvider = dynamic(() => import('./AuthContext').then(mod => mod.AuthProvider), { ssr: false });
const DndProvider = dynamic(() => import('react-dnd').then(mod => mod.DndProvider), { ssr: false });
const GraphQLProvider = dynamic(import('graphql/client/GraphQLProvider'), { ssr: false });
const NFTListingsContextProvider = dynamic(import('components/modules/Checkout/NFTListingsContext'), { ssr: false });
const NFTPurchaseContextProvider = dynamic(import('components/modules/Checkout/NFTPurchaseContext'), { ssr: false });
const NotificationContextProvider = dynamic(import('components/modules/Notifications/NotificationContext'), { ssr: false });

const RootProvider = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <SWRConfig value={config}>
      <CryptoWalletProvider>
        <AuthProvider>
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
        </AuthProvider>
      </CryptoWalletProvider>
    </SWRConfig>
  );
};

export default RootProvider;
