import NotificationsModal from 'components/modules/Notifications/NotificationsModal';
import { useChangeWallet } from 'hooks/state/useChangeWallet';
import { useSignOutDialog } from 'hooks/state/useSignOutDialog';
import { useOutsideClickAlerter } from 'hooks/useOutsideClickAlerter';
import { Doppler, getEnvBool } from 'utils/env';
import { tw } from 'utils/tw';

import { utils } from 'ethers';
import { useRouter } from 'next/router';
import { CaretUp } from 'phosphor-react';
import ETHIcon from 'public/icons/eth_icon.svg?svgr';
import { PropsWithChildren, useCallback, useRef, useState } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';

export interface WalletDropdownProps {
  count: number
  constrain?: boolean;
}

export function WalletDropdown(props: PropsWithChildren<WalletDropdownProps>) {
  const { address: currentAddress } = useAccount();
  const { disconnect } = useDisconnect();
  const { setSignOutDialogOpen } = useSignOutDialog();
  const { setChangeWallet } = useChangeWallet();
  const { data: balanceData } = useBalance({ address: currentAddress, watch: true });
  const router = useRouter();
  const [notificationsModalVisible, setNotificationModalVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  useOutsideClickAlerter(wrapperRef, () => {
    setExpanded(false);
  });

  const setModalVisibile = useCallback((input: boolean) => {
    setNotificationModalVisible(input);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={tw(
        'relative',
        'flex flex-col items-end rounded-xl',
        'text-base',
        props.constrain ? '' : 'w-full h-full shrink-0',
        'dark:text-always-white text-primary-txt',
        'whitespace-nowrap justify-between',
      )}
    >
      <div
        ref={anchorRef}
        className={tw(
          'flex flex-row items-end px-2.5',
          'bg-transparent dark:bg-secondary-dk',
          'py-2 h-full',
          'justify-between rounded-xl w-full',
        )}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        {props.children}
      </div>

      {expanded &&
        <div
          style={{
            marginTop: anchorRef.current.clientHeight + 8
          }}
          className={tw(
            'rounded-xl',
            'bg-white dark:bg-secondary-dk',
            'absolute z-50 px-4 pb-6',
            'min-w-[12rem] drop-shadow-md left-[-150%] minlg:left-[-100%]',
          )}
        >
          <CaretUp size={32} color="white" weight="fill" className='absolute -top-[18px] left-[50%]'/>
          <div
            style={{ height: '10%' }}
            className={'flex flex-row w-full py-2 items-center justify-between hover:cursor-pointer text-primary-txt font-medium'}
            onClick={() => setNotificationModalVisible(true)}
          >
            <p>Notifications</p>
            <span className="flex items-center h-5 min-w-[20px] relative z-50 text-black font-semibold">
              <span
                className={tw(
                  'bg-[#E43D20] text-white',
                  'relative rounded-full min-w-[24px] h-6',
                  'flex justify-center items-center px-[5px] pt-0.5 leading-[0px] text-[11px] font-noi-grotesk',
                  'border-white border-[3px]'
                )}>
                {props.count}
              </span>
            </span>
          </div>

          <div
            style={{ height: '10%' }}
            className={'flex flex-row w-full  py-2 items-center hover:cursor-pointer text-primary-txt font-medium '}
            onClick={() => {
              router.push('/app/assets');
              setExpanded(false);
            }}
          >
            Assets
          </div>

          {getEnvBool(Doppler.NEXT_PUBLIC_ACTIVITY_PAGE_ENABLED) &&
            <div
              style={{ height: '10%' }}
              className={'flex flex-row w-full py-2 items-center hover:cursor-pointer text-primary-txt font-medium'}
              onClick={() => {
                router.push('/app/activity');
                setExpanded(false);
              }}
            >
            Activity
            </div>
          }

          <div
            style={{ height: '10%' }}
            className={'flex flex-row w-full py-2 items-center hover:cursor-pointer hover:text-primary-txt font-medium text-[#6A6A6A]'}
            onClick={() => {
              disconnect();
              setSignOutDialogOpen(true);
              setExpanded(false);
              setChangeWallet(true);
            }}
          >
            Change Wallet
          </div>
          <div
            onClick={() => {
              disconnect();
              setSignOutDialogOpen(true);
              setExpanded(false);
            }}
            style={{ height: '10%' }}
            className={'flex flex-row w-full py-2 items-center hover:cursor-pointer hover:text-primary-txt font-medium text-[#6A6A6A]'}
          >
            Sign Out
          </div>

          <div className='border-t border-[#ECECEC] pt-4 flex justify-between'>
            <p className='font-medium text-[#B2B2B2] whitespace-normal w-1/3'>Token Balance</p>

            <div className='w-2/3 flex justify-end items-end text-lg font-medium'>

              <p className='items-center justify-center flex'>
                <ETHIcon className='inline mb-0.5 mr-3' stroke="black" />
                {(+utils.formatEther(balanceData?.value ?? 0)).toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      }
      <NotificationsModal visible={notificationsModalVisible} setVisible={setModalVisibile} />
    </div>
  );
}
