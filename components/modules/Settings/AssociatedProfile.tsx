import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import CustomTooltip from 'components/elements/CustomTooltip';
import { DropdownPickerModal } from 'components/elements/DropdownPickerModal';
import { Modal } from 'components/elements/Modal';
import { NotificationContext } from 'components/modules/Notifications/NotificationContext';
import { useIgnoreAssociationsMutation } from 'graphql/hooks/useIgnoreAssociationsMutation';
import { usePendingAssociationQuery } from 'graphql/hooks/usePendingAssociationQuery';
import { useUpdateHiddenMutation } from 'graphql/hooks/useUpdateHiddenMutation';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { filterNulls } from 'utils/format';
import { getEtherscanLink, shortenAddress } from 'utils/helpers';

import RemoveModal from './RemoveModal';

import { ArrowsClockwise, CheckCircle, Clock, DotsThreeOutlineVertical, GasPump, XCircle } from 'phosphor-react';
import { useCallback, useContext, useState } from 'react';
import { ExternalLink as LinkIcon } from 'react-feather';
import { toast } from 'react-toastify';
import { ExternalLink } from 'styles/theme';
import { mutate } from 'swr';
import { useAccount, useNetwork } from 'wagmi';

type AssociatedProfileProps = {
  profile: {
    profileUrl?: string;
    addr?: string;
    owner?: string;
    url?: string;
    id?: string
  }
  pending?: boolean;
  remove?: () => void
  isCollection?: boolean
  isRemoved?: boolean
};

export default function AssociatedProfile({ profile, pending, remove, isCollection, isRemoved }: AssociatedProfileProps) {
  const { mutate: mutatePending } = usePendingAssociationQuery();
  const { ignoreAssociations } = useIgnoreAssociationsMutation();
  const [visible, setVisible] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [associationRejected, setAssociationRejected] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const { chain } = useNetwork();
  const { nftResolver } = useAllContracts();
  const {
    setUserNotificationActive
  } = useContext(NotificationContext);
  const { address: currentAddress } = useAccount();
  const { updateHidden } = useUpdateHiddenMutation();

  const acceptPendingProfile = useCallback(async (e, url) => {
    e.preventDefault();

    const tx = await nftResolver.associateSelfWithUsers([url]);
    setTransactionPending(true);
    if (tx) {
      await tx.wait(1).then(() => {
        setAccepted(true);
        setTransactionPending(false);
        gtag('event', 'Accepted Profile Association', {
          ethereumAddress: currentAddress,
          profile: url,
        });
      }).catch(() => toast.error('Error'));
      setUserNotificationActive('associatedProfileAdded', true);
    }
  }, [nftResolver, setUserNotificationActive, currentAddress]);

  const removeHandler = useCallback(async () => {
    if (pending) {
      await ignoreAssociations({ eventIdArray: [profile.id] })
        .then(() => {
          setVisible(true);
          setAssociationRejected(true);
          toast.success('Rejected');
          gtag('event', 'Reject Profile Association', {
            ethereumAddress: currentAddress,
            profile: profile,
          });
        })
        .catch(() => toast.warning('Error. Please try again'));
    } else if (isRemoved) {
      updateHidden({ eventIdArray: [profile.id], hidden: true }).then(() => {
        toast.success('Removed');
        setVisible(true);
        setAssociationRejected(true);
      });
    } else {
      const tx = await nftResolver.removeAssociatedProfile(profile[1] || profile.profileUrl || profile.url);
      setTransactionPending(true);
      if (tx) {
        await tx.wait(1).then(() => {
          gtag('event', 'Remove Profile Association', {
            ethereumAddress: currentAddress,
            profile: profile,
          });
          setTransactionPending(false);
          setRemoveModalVisible(false);
          toast.success('Removed');
          setUserNotificationActive('associatedProfileRemoved', true);
          setAssociationRejected(true);
        }).catch(() => toast.warning('Error. Please try again'));
      }
    }
  }, [ignoreAssociations, isRemoved, nftResolver, pending, profile, setUserNotificationActive, updateHidden, currentAddress]);

  const closeModal = useCallback(() => {
    if (associationRejected) {
      setAssociationRejected(false);
    }
    if (accepted) {
      setAccepted(false);
    }
    mutate('SettingsAssociatedProfiles' + currentAddress);
    mutatePending();
    setVisible(false);
  }, [accepted, associationRejected, mutatePending, currentAddress]);

  return (
    <>
      <div className='p-1 flex justify-between items-start mb-3'>
        <div className='flex items-start'>
          {pending ?
            <CustomTooltip
              orientation='right'
              tooltipComponent={
                <div
                  className="p-3 max-w-xs"
                >
                  <p className='text-[#F2890E] mb-2'>Pending</p>
                  <p>This NFT Profile association is waiting your approval. Click on its name to approve or reject.</p>
                </div>
              }
            >
              <Clock data-cy="PendingProfile" size={25} className='mr-3' color='orange' weight='fill' />
            </CustomTooltip>
            :
            isRemoved
              ?
              (
                isRemoved && isCollection ?
                  <XCircle size={25} className='mr-3' color='#D40909' weight='fill' />
                  :
                  <CustomTooltip
                    orientation='right'
                    tooltipComponent={
                      <div
                        className="p-3 max-w-xs"
                      >
                        <p className='text-[#D40909] mb-2'>Disassociated</p>
                        <p>This NFT Profile has been disassociated from your address. It is safe to remove it from your account.</p>
                      </div>
                    }
                  >
                    <XCircle data-cy="RemovedProfile" size={25} className='mr-3' color='#D40909' weight='fill' />
                  </CustomTooltip>
              )
              :
              (
                <CustomTooltip
                  orientation='right'
                  tooltipComponent={
                    <div
                      className="p-3 max-w-xs"
                    >
                      <p className='text-[#00AC30] mb-2'>Associated</p>
                      <p>You have associated your address with this NFT Profile.</p>
                    </div>
                  }
                >
                  <CheckCircle data-cy="ApprovedProfile" size={25} className='mr-3 rounded-full' color='green' weight="fill" />
                </CustomTooltip>
              )
          }
          <div className='w-3/4'>
            <p onClick={pending ? () => setVisible(true) : null} className='truncate text-black text-sm font-noi-grotesk font-semibold tracking-wide'>{profile.profileUrl || profile.url}</p>
            <div className="flex items-center w-full">
              <div className="flex w-full items-center justify-between">
                <div>
                  {isCollection && isRemoved
                    ?
                    (
                      <p className='text-[#6F6F6F] text-sm mt-1'>The deployer wallet associated to this collection has been disconnected from your account. Please connect another collection.</p>
                    )
                    :
                    (
                      <ExternalLink
                        href={getEtherscanLink(chain?.id, profile.addr || profile.owner, 'address')}
                      >
                        <div
                          className='flex justify-between font-mono text-blog-text-reskin text-sm font-medium'
                        >
                          {shortenAddress(profile?.addr || profile?.owner)}
                          <LinkIcon size={18} className='ml-2' />
                        </div>
                      </ExternalLink>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center'>
          <DropdownPickerModal
            constrain
            selectedIndex={0}
            options={filterNulls([
              isCollection && {
                label: 'Change Collection',
                onSelect: () => remove(),
                icon: null,
              },
              !isCollection && pending && {
                label: 'Approve',
                onSelect: () => setVisible(true),
                icon: null,
              },
              !isCollection && {
                label: pending ? 'Reject' : 'Remove',
                onSelect: () => setRemoveModalVisible(true),
                icon: null,
              },
              !isCollection && {
                label: 'View on Etherscan',
                onSelect: () => {
                  window.open(getEtherscanLink(chain?.id, profile.addr || profile.owner, 'address'));
                },
                icon: null,
              }
            ])}>
            <DotsThreeOutlineVertical data-cy="ProfileDropdown" size={25} weight='fill' className='ml-2 hover:cursor-pointer text-black' />
          </DropdownPickerModal>
        </div>
      </div>

      <Modal
        visible={visible}
        loading={false}
        title={''}
        onClose={() => {
          setVisible(false);
        }}
        bgColor='white'
        hideX
        fullModal
        pure
      >
        <div className='max-w-full minlg:max-w-[458px] h-screen minlg:h-max maxlg:h-max bg-white text-left px-4 pb-10 rounded-none minlg:rounded-[10px] minlg:mt-24 minlg:m-auto'>
          <div className='pt-16 font-noi-grotesk lg:max-w-md max-w-lg m-auto minlg:relative'>
            <div className='absolute top-4 right-4 minlg:right-1 hover:cursor-pointer w-6 h-6 bg-[#F9D963] rounded-full'></div>
            <XCircle onClick={() => setVisible(false)} className='absolute top-3 right-3 minlg:right-0 hover:cursor-pointer' size={32} color="black" weight="fill" />
            {
              transactionPending ?
                <>
                  <div className='flex mb-10 items-center'>
                    <ArrowsClockwise size={32} color="#6f6f6f" weight="fill" className='mr-2 animate-spin-slow' />
                    <h2 className='text-4xl tracking-wide font-bold'>One second...</h2>
                  </div>

                  <p className='text-[#6F6F6F]'>We’re waiting for the transaction to complete.</p>
                </>
                :
                !associationRejected ?
                  (
                    !accepted
                      ? (
                        <div>
                          <h2 className='text-4xl tracking-wide font-bold mb-10'>Approve Request</h2>
                          <p className='text-[#6F6F6F] mb-4'>
                            <span className='text-black font-bold tracking-wide'>
                              {profile.profileUrl || profile.url}{' '}
                            </span>
                            is requesting to associate your address to their NFT Profile.
                          </p>
                          <p className='text-[#6F6F6F]'>This profile is owned by address</p>
                          <ExternalLink
                            href={getEtherscanLink(chain?.id, profile.addr || profile.owner, 'address')}
                          >
                            <div
                              className='flex font-mono text-black text-sm font-bold tracking-wide mb-4'
                            >
                              {shortenAddress(profile?.addr || profile?.owner)}
                              <LinkIcon size={18} className='ml-2' />
                            </div>
                          </ExternalLink>

                          <p className='text-[#6F6F6F] mb-3'>
                            If you approve this request, your NFTs will be available to display on their profile{'\''}s gallery.
                            <span className='text-black font-bold tracking-wide'>
                              {' '}{profile.profileUrl || profile.url}{' '}
                            </span>
                            will <span className='text-black font-bold tracking-wide'>NOT</span> be able to make any changes to your address or its contents. You can change this connection at any time in your account’s settings.
                          </p>
                          <Button
                            type={ButtonType.PRIMARY}
                            size={ButtonSize.LARGE}
                            label='Approve Request'
                            onClick={(e) => acceptPendingProfile(e, profile.profileUrl || profile.url)}
                            stretch
                          />
                          <div className='flex items-center font-noi-grotesk text-blog-text-reskin justify-center mt-2 mb-6 text-sm'>
                            <GasPump size={20} weight="fill" />
                            <p className='ml-1'>This action will require a<span className='border-dashed	border-b border-[#6F6F6F]'> gas fee.</span></p>
                          </div>
                          <p className='underline text-center font-bold tracking-wide hover:cursor-pointer' onClick={() => { setRemoveModalVisible(true); setVisible(false); }}>Reject Request</p>
                        </div>
                      )
                      :
                      (
                        <div>
                          <h2 className='text-4xl tracking-wide font-bold mb-10'>Profile Connected</h2>
                          <p className='text-[#6F6F6F] mb-4'>
                            Congratulations! You have associated the NFT Profile{' '}
                            <span className='text-black font-bold tracking-wide'>{profile.profileUrl || profile.url}{' '}</span>
                            to your address.
                          </p>
                          <p className='text-[#6F6F6F] mb-4'>
                            As a reminder, your NFTs will be available to display on their NFT Profile’s gallery.{' '}
                            <span className='text-black font-bold tracking-wide'>
                              {profile.profileUrl || profile.url}{' '}
                            </span>
                            will
                            <span className='text-black font-bold tracking-wide'>
                              {' '}NOT{' '}
                            </span>
                            be able to make any changes to your address or its contents. </p>
                          <p className='text-[#6F6F6F] mb-6'>
                            You can change this association at any time in your account’s settings.
                          </p>
                          <Button
                            label='Return to NFT.com'
                            type={ButtonType.PRIMARY}
                            size={ButtonSize.LARGE}
                            stretch
                            onClick={closeModal}
                          />
                        </div>
                      )
                  )
                  :
                  (
                    <div>
                      <h2 className='text-4xl tracking-wide font-bold mb-10'>Profile Rejected</h2>
                      <p className='text-[#6F6F6F] mb-4'>
                        You have denied access to the NFT Profile
                        <span className='text-black font-bold tracking-wide'>{' '}{profile.profileUrl || profile.url}</span>
                      </p>
                      <p className='text-[#6F6F6F] mb-6'>Your NFTs will not display on their NFT Profile`&apos;`s gallery.</p>

                      <Button
                        onClick={closeModal}
                        size={ButtonSize.LARGE}
                        type={ButtonType.PRIMARY}
                        stretch
                        label='Return to NFT.com'
                      />
                    </div>
                  )
            }
          </div>
        </div>
      </Modal>
      {removeModalVisible && <RemoveModal isTxPending={transactionPending} isProfile isRemoved={isRemoved} rejected={pending} visible={removeModalVisible} setVisible={setRemoveModalVisible} profileUrl={profile.profileUrl || profile.url} address={profile.owner || profile.addr} remove={removeHandler} />}
    </>
  );
}
