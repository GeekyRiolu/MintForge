import ClientOnly from 'components/elements/ClientOnly';
import { useSidebar } from 'hooks/state/useSidebar';
import { shortenAddress } from 'utils/helpers';
import { tw } from 'utils/tw';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Wallet } from 'phosphor-react';
import { SetStateAction } from 'react';
import { useAccount } from 'wagmi';

type SidebarProfileCardProps = {
  profile: {
    metadata: {
      header: string
      image: string
    }
    title: string
  }
  onClick?: (value?: string | SetStateAction<boolean> | SetStateAction<string> ) => void
  opensModal?: boolean
  message?: string
  showSwitch?: boolean
  isSelected?: boolean
  isSidebar?: boolean
};

export function SidebarProfileCard({ profile, onClick, message, showSwitch, opensModal, isSelected, isSidebar }: SidebarProfileCardProps) {
  const { address: currentAddress } = useAccount();
  const router = useRouter();
  const { setSidebarOpen } = useSidebar();
  return (
    <motion.div className={tw(
      'rounded-[10px] box-border',
      isSelected && 'outline-[#F9D963] outline-offset-[-2px] outline-3 outline'
    )}>
      {isSidebar
        ?
        <motion.div
          style={{
            backgroundImage: `url("${profile?.metadata?.header}")`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            boxShadow: 'inset 0 0 0 1000px rgba(0,0,0,.8)'
          }}
          className={tw(
            'rounded-t-[10px] hover:cursor-pointer w-full bg-cover bg-center box-border h-20',
          )}
        >
          <div className='flex items-center 4 px-4 rounded-[10px] h-full' >
            {profile?.metadata?.image &&
            <Image
              onClick={() => {
                router.push(`/${profile?.title}`);
                setSidebarOpen(false);
              }} className='rounded-full'
              width={50}
              height={50}
              alt={`profile for ${profile?.title}`}
              src={profile?.metadata?.image}
            />}
            <div className='flex justify-between w-full h-full'>
              <div
                className='flex items-center w-full'
                onClick={() => {
                  router.push(`/${profile?.title}`);
                  setSidebarOpen(false);
                }}>
                {message &&
                <p className='font-noi-grotesk text-xs text-[#F9D963] leading-6 font-bold -mb-1 ml-3 tracking-wider uppercase'>{message}</p>
                }
                <div>
                  <p className='font-noi-grotesk text-base text-white leading-6 font-medium ml-3 tracking-wide w-full'>{profile?.title}</p>
                  <div className='flex ml-3'>
                    <Wallet size={23} color="#D5D5D5" weight="fill" className='mr-1' />
                    <ClientOnly>
                      <p className='font-mono text-base text-[#D5D5D5] leading-6 font-medium tracking-wide w-full'>{shortenAddress(currentAddress, 4)}</p>
                    </ClientOnly>
                  </div>
                </div>
              </div>
              <div className='h-full flex items-center' onClick={onClick ? !opensModal ? () => onClick(profile?.title) : () => onClick(true) : null}>
                <p data-cy='profileCardSwitchSidebar' className='text-[#F9D963]'>Switch</p>
              </div>
            </div>
          </div>
        </motion.div>
        :
        <motion.div
          style={{
            backgroundImage: `url("${profile?.metadata?.header}")`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            boxShadow: 'inset 0 0 0 1000px rgba(0,0,0,.8)'
          }}
          className={tw(
            'rounded-[10px] hover:cursor-pointer w-full bg-cover bg-center box-border h-20',
          )}
          onClick={onClick ? !opensModal ? () => onClick(profile?.title) : () => onClick(true) : null}
        >
          <div className='flex items-center py-4 px-4 rounded-[10px] h-full' >
            {profile?.metadata?.image && <Image className='rounded-full' width={50} height={50} alt={`profile for ${profile?.title}`} src={profile?.metadata?.image} />}
            <div className='flex justify-between w-full'>
              <div>
                {message &&
                <p className='font-noi-grotesk text-xs text-[#F9D963] leading-6 font-bold -mb-1 ml-3 tracking-wider uppercase'>{message}</p>
                }
                <p className='font-noi-grotesk text-base text-white leading-6 font-medium ml-3 tracking-wide'>{profile?.title}</p>
              </div>
              {showSwitch && <p data-cy='profileCardSwitch' className='text-[#F9D963]'>Switch</p>}
            </div>
          </div>
        </motion.div>
      }
    </motion.div>
  );
}
