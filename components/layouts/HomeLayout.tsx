import ClientOnly from 'components/elements/ClientOnly';
import { Footer } from 'components/elements/Footer/Footer';
import { Header } from 'components/elements/Header';
import { MobileSidebar } from 'components/elements/MobileSidebar';
import { SignOutModal } from 'components/elements/SignOutModal';
import { SearchModal } from 'components/modules/Search/SearchModal';
import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { useChangeWallet } from 'hooks/state/useChangeWallet';
import { useProfileSelectModal } from 'hooks/state/useProfileSelectModal';
import { useSearchModal } from 'hooks/state/useSearchModal';
import { useSignOutDialog } from 'hooks/state/useSignOutDialog';
import { useUser } from 'hooks/state/useUser';
import { tw } from 'utils/tw';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import dynamic from 'next/dynamic';
import { useContext } from 'react';

type HomeLayoutProps = {
  children: React.ReactNode;
  hideFooter?: boolean;
  hideHeader?: boolean;
};

const DynamicProfileSelectModal = dynamic(import('components/modules/ProfileFactory/ProfileSelectModal'));

export default function HomeLayout({ children, hideFooter, hideHeader }: HomeLayoutProps) {
  const { setCurrentProfileUrl } = useUser();
  const { openConnectModal } = useConnectModal();
  const { signOutDialogOpen, setSignOutDialogOpen } = useSignOutDialog();
  const { changeWallet, setChangeWallet } = useChangeWallet();
  const { setProfileSelectModalOpen, profileSelectModal } = useProfileSelectModal();
  const { signed } = useContext(GraphQLContext);
  const { searchModalOpen } = useSearchModal();

  return (
    <div className={tw('flex flex-col',
      'w-full min-w-screen min-h-screen overflow-hidden',
    )}>
      <div
        className='flex-1 w-full'
        style={{ minHeight: '100vh' }}
      >
        {!hideHeader &&
        <ClientOnly>
          <Header homepageHeader />
          <MobileSidebar/>
          {searchModalOpen && <SearchModal />}
        </ClientOnly>
        }

        {children}

        {profileSelectModal && signed && <DynamicProfileSelectModal />}
        {signOutDialogOpen &&
          <SignOutModal
            visible={signOutDialogOpen}
            onClose={() => {
              setSignOutDialogOpen(false);
              changeWallet && openConnectModal();
              setChangeWallet(false);
              setProfileSelectModalOpen(false);
              setCurrentProfileUrl('');
            }}
          />
        }
        {!hideFooter && <Footer isLarge />}
      </div>
    </div>
  );
}
