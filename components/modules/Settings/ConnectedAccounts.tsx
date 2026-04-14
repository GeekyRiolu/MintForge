import { Maybe } from 'graphql/generated/types';
import { useIgnoredEventsQuery } from 'graphql/hooks/useIgnoredEventsQuery';
import { useUpdateHideIgnored } from 'graphql/hooks/useUpdateHideIgnored';
import { useAllContracts } from 'hooks/contracts/useAllContracts';

import AssociatedAddress from './AssociatedAddress';
import RequestModal from './RequestModal';
import SettingsForm from './SettingsForm';

import { useEffect, useState } from 'react';
import { mutate } from 'swr';
import { PartialDeep } from 'type-fest';
import { useAccount } from 'wagmi';

type Address = {
  chainAddr: string;
}

export type RejectedEvent = {
  id: string;
  destinationAddress: string;
  txHash: string;
  hideIgnored: boolean
}

type ConnectedAccountsProps = {
  selectedProfile: string;
  associatedAddresses: Maybe<{
    pending: Address[];
    accepted: Address[];
    denied: PartialDeep<RejectedEvent>[]
  }>;
};

export default function ConnectedAccounts({ selectedProfile, associatedAddresses }: ConnectedAccountsProps) {
  const { address: currentAddress } = useAccount();
  const { mutate: mutateHidden } = useIgnoredEventsQuery({ profileUrl: selectedProfile, walletAddress: currentAddress });
  const { nftResolver } = useAllContracts();
  const [inputVal, setInputVal] = useState('');
  const [transaction, setTransaction] = useState('');
  const [isAssociatedOrPending, setIsAssociatedOrPending] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const { updateHideIgnored } = useUpdateHideIgnored();

  const submitHandler = async (input?: string) => {
    const address = input || inputVal;
    const deniedEvent = associatedAddresses?.denied?.find((evt) => evt.destinationAddress === address);
    if (deniedEvent) {
      updateHideIgnored({ hideIgnored: false, eventIdArray: [deniedEvent.id] })
        .then(() => {
          mutateHidden();
          setTransaction(deniedEvent.txHash);
          setSuccess(true);
          setModalVisible(true);
          mutate('SettingsAssociatedAddresses' + selectedProfile + currentAddress);
        });
    } else {
      const tx = await nftResolver.addAssociatedAddresses([{ cid: 0, chainAddr: address }], selectedProfile);
      setTransactionPending(true);
      if (tx) {
        await tx.wait(1).then(() => {
          setSuccess(true);
          setTransaction(tx.hash);
          setModalVisible(true);
          setTransactionPending(false);
          mutate('SettingsAssociatedAddresses' + selectedProfile + currentAddress);
          gtag('event', 'Association Sent', {
            ethereumAddress: currentAddress,
            profile: selectedProfile,
            destinationAddress: address
          });
        });
      }
    }
  };

  const openModal = () => {
    setModalVisible(true);
  };

  useEffect(() => {
    if (associatedAddresses?.pending.find(element => element.chainAddr === inputVal) || associatedAddresses?.accepted.find(element => element.chainAddr === inputVal)) {
      setIsAssociatedOrPending(true);
    } else {
      setIsAssociatedOrPending(false);
    }
  }, [inputVal, associatedAddresses, currentAddress]);

  return (
    <div id="addresses" className='font-noi-grotesk'>
      <h2 className='text-black mb-2 font-bold text-2xl tracking-wide'>Associate Addresses</h2>
      <p className='text-blog-text-reskin mb-4'>The NFTs contained or collections deployed by associated Ethereum addresses will display on this NFT Profile.</p>

      <SettingsForm buttonText='Request Association' submitHandler={openModal} {...{ inputVal, isAssociatedOrPending }} changeHandler={setInputVal} />

      {associatedAddresses?.accepted?.length || associatedAddresses?.pending?.length || associatedAddresses?.denied?.length
        ? (
          <div className='mt-6 w-full'>
            <p className='text-blog-text-reskin mb-2 font-semibold pl-1'>Associated Addresses</p>
            <div className='p-1 flex  justify-between mb-1'>
              <p className='w-1/2 mr-[3.1rem] text-blog-text-reskin text-sm'>Address</p>
              <p className='w-1/2 text-blog-text-reskin text-sm'>Network</p>
            </div>

            {associatedAddresses?.accepted.map((address, index) => (
              <AssociatedAddress {...{ selectedProfile }} key={index} address={address.chainAddr} />
            ))}
            {associatedAddresses?.pending.map((address, index) => (
              <AssociatedAddress {...{ selectedProfile }} pending key={index} address={address.chainAddr} />
            ))}
            {associatedAddresses?.denied?.map((address) => (
              !address.hideIgnored &&
              <AssociatedAddress {...{ selectedProfile }} rejected key={address.id} eventId={address.id} address={address.destinationAddress} submit={submitHandler} />
            ))}
          </div>
        )
        : null}
      {modalVisible && <RequestModal {...{ submitHandler, success }} isPending={transactionPending} address={inputVal} transaction={transaction} visible={modalVisible} setVisible={setModalVisible} setAddressVal={setInputVal} />}
    </div>
  );
}
