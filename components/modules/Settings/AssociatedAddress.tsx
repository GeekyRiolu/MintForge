import CustomTooltip from 'components/elements/CustomTooltip';
import { DropdownPickerModal } from 'components/elements/DropdownPickerModal';
import { useIgnoredEventsQuery } from 'graphql/hooks/useIgnoredEventsQuery';
import { useUpdateHideIgnored } from 'graphql/hooks/useUpdateHideIgnored';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { filterNulls } from 'utils/format';
import { getEtherscanLink, shortenAddress } from 'utils/helpers';

import RemoveModal from './RemoveModal';

import { ContractTransaction } from 'ethers';
import { CheckCircle, Clock, DotsThreeOutlineVertical, XCircle } from 'phosphor-react';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { mutate } from 'swr';
import { useAccount, useNetwork } from 'wagmi';

type AssociatedAddressProps = {
  address: string;
  pending?: boolean;
  rejected?: boolean;
  submit?: (address: string) => void;
  isOpen?: boolean
  setIsOpen?: (input: boolean) => void;
  eventId?: string
  selectedProfile: string
};

export default function AssociatedAddress({ address, pending, rejected, submit, eventId, selectedProfile }: AssociatedAddressProps) {
  const { address: currentAddress } = useAccount();
  const { mutate: mutateHidden } = useIgnoredEventsQuery({ profileUrl: selectedProfile, walletAddress: currentAddress });
  const { updateHideIgnored } = useUpdateHideIgnored();
  const { nftResolver } = useAllContracts();
  const { chain } = useNetwork();
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [txPending, setTxPending] = useState(false);

  const removeHandler = useCallback(async () => {
    if(rejected){
      updateHideIgnored({ hideIgnored: true, eventIdArray: [eventId] })
        .then(() => {
          mutateHidden();
          setRemoveModalVisible(false);
          toast.success('Removed');
        })
        .catch(() => toast.error('Error'));
    } else {
      await nftResolver
        .removeAssociatedAddress({ cid: 0, chainAddr: address }, selectedProfile)
        .then(async (tx: ContractTransaction) => {
          setTxPending(true);
          await tx.wait(1).then(() => {
            toast.success('Removed');
            setTxPending(false);
            setRemoveModalVisible(false);
            // todo: refactor state management in settings page so we don't have to use a general mutator.
            mutate('SettingsAssociatedAddresses' + selectedProfile + currentAddress);
          });
        })
        .catch(() => toast.error('Error'));
    }
  }, [address, currentAddress, eventId, mutateHidden, nftResolver, rejected, selectedProfile, updateHideIgnored]);

  return (
    <>
      <div className='p-1 flex justify-between mb-1 font-mono text-sm'>
        <div className='flex row items-center'>
          {pending || rejected ?
            pending ?
              (
                <CustomTooltip
                  orientation='right'
                  tooltipComponent={
                    <div
                      className="rounded-xl p-3 bg-modal-bg-dk text-white max-w-xs"
                    >
                      <p className='text-[#F2890E] mb-2'>Pending</p>
                      <p>This address association is waiting approval.</p>
                    </div>
                  }
                >
                  <Clock data-cy='PendingAssociation' size={25} className='mr-3' color='orange' weight='fill' />
                </CustomTooltip>
              ):
              (
                <CustomTooltip
                  orientation='right'
                  tooltipComponent={
                    <div
                      className="rounded-xl p-3 bg-modal-bg-dk text-white max-w-xs"
                    >
                      <p className='text-[#D50909] mb-2'>Rejected</p>
                      <p>This address has rejected the association. If this was done in error, please resend the request. No gas is required.</p>
                    </div>
                  }
                >
                  <XCircle data-cy='RejectedAssociation' size={25} className='mr-3' color='#D40909' weight='fill' />
                </CustomTooltip>
              )
            :
            <CustomTooltip
              orientation='right'
              tooltipComponent={
                <div
                  className="rounded-xl p-3 bg-modal-bg-dk text-white max-w-xs"
                >
                  <p className='text-[#00AC30] mb-2'>Associated</p>
                  <p>This address has approved the NFT Profile association. </p>
                </div>
              }
            >
              <CheckCircle data-cy='ApprovedAssociation' size={25} className='mr-3 rounded-full' color='green' weight="fill" />
            </CustomTooltip>
          }
        </div>

        <div className='flex items-center truncate w-1/2 mr-4'>
          <p className='truncate text-black'>{shortenAddress(address)}</p>
        </div>

        <div className='flex items-center w-1/2 justify-between'>
          <p>Ethereum</p>
          <DropdownPickerModal
            constrain
            selectedIndex={0}
            options={filterNulls([
              {
                label: 'Remove',
                onSelect: () => setRemoveModalVisible(true),
                icon: null,
              },
              {
                label: 'View on Etherscan',
                onSelect: () => {
                  window.open(getEtherscanLink(chain?.id, address, 'address'));
                },
                icon: null,
              },
              rejected && {
                label: 'Resend Request',
                onSelect: () => submit(address),
                icon: null,
              },
            ])
            }>
            <DotsThreeOutlineVertical data-cy='AssociationDropdown' size={25} weight='fill' className='ml-2 hover:cursor-pointer text-black' />
          </DropdownPickerModal>
        </div>
      </div>
      {removeModalVisible && <RemoveModal {...{ address }} isTxPending={txPending} remove={removeHandler} rejected={rejected} visible={removeModalVisible} setVisible={setRemoveModalVisible} />}
    </>
  );
}
