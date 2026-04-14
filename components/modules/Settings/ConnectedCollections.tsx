import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { Modal } from 'components/elements/Modal';
import { AddressTupleStructOutput } from 'constants/typechain/Nft_resolver';
import { useAssociatedAddressesForContractQuery } from 'graphql/hooks/useAssociatedAddressesForContractQuery';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { getContractMetadata } from 'utils/alchemyNFT';
import { isNullOrEmpty } from 'utils/format';
import { sameAddress } from 'utils/helpers';

import AssociatedProfile from './AssociatedProfile';
import SettingsForm from './SettingsForm';

import { ArrowsClockwise, GasPump, XCircle } from 'phosphor-react';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { useAccount, useSigner } from 'wagmi';

type ConnectedCollectionsProps = {
  selectedProfile: string;
};

export default function ConnectedCollections({ selectedProfile }: ConnectedCollectionsProps) {
  const { address: currentAddress } = useAccount();
  const { data: signer } = useSigner();
  const { nftResolver } = useAllContracts();
  const [connectedCollection, setConnectedCollection] = useState(null);
  const [inputVal, setInputVal] = useState<string>('');
  const { data } = useAssociatedAddressesForContractQuery({ contract: connectedCollection?.chainAddr });
  const { data: newCollection, mutate: mutateNewCollectionContract } = useAssociatedAddressesForContractQuery({ contract: inputVal });
  const [visible, setVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const [changeCollection, setChangeCollection] = useState(false);
  const [lookupInProgress, setLookupInProgress] = useState(true);
  const [collectionNameModal, setCollectionNameModal] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAssociated, setIsAssociated] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);

  const fetchAssociatedCollection = useCallback(
    async (profile) => {
      await nftResolver.associatedContract(profile)
        .then((res) => {
          setConnectedCollection(res);
          lookupCollectionName(res.chainAddr)
            .then((res2) => setCollectionName(res2?.contractMetadata?.name || res.chainAddr))
            .catch(() => Promise.resolve([]));
        });
    },
    [nftResolver],
  );

  const { data: associatedAddresses } = useSWR<AddressTupleStructOutput[]>(
    'AssociatedAddresses' + selectedProfile,
    async () => {
      return await nftResolver.connect(signer).associatedAddresses(selectedProfile).catch(() => null);
    }
  );

  useEffect(() => {
    if(connectedCollection?.chainAddr === inputVal){
      setIsAssociated(true);
    } else {
      setIsAssociated(false);
    }
  }, [inputVal, currentAddress, connectedCollection]);

  useEffect(() => {
    if(selectedProfile && currentAddress) {
      fetchAssociatedCollection(selectedProfile).catch(console.error);
    }
    if(!currentAddress){
      setConnectedCollection([]);
    }
  }, [fetchAssociatedCollection, selectedProfile, currentAddress]);

  useEffect(() => {
    if(newCollection && !newCollection?.associatedAddressesForContract?.deployerIsAssociated){
      setNotAuthorized(true);
    }
    if(newCollection !== undefined){
      setLookupInProgress(false);
    }
    if(data){
      setLoading(false);
    }
  }, [newCollection, data]);

  const openModal = async () => {
    setVisible(true);
    await lookupCollectionName(inputVal)
      .then((res) => {
        setCollectionName(res?.contractMetadata?.name);
        setVisible(true);
      });
  };

  const changeHandler = async (e) => {
    setInputVal(e);
    mutateNewCollectionContract();
  };

  const removeHandler = async () => {
    setVisible(true);
    setChangeCollection(true);
  };

  const lookupCollectionName = async (addr): Promise<any> => {
    return await getContractMetadata(addr);
  };

  const getModalContent = useCallback(() => {
    const submitHandler = async () => {
      setTransactionPending(true);
      const address = inputVal;
      const tx = await nftResolver.setAssociatedContract( { cid: 0, chainAddr: address } , selectedProfile);
      if(tx){
        tx.wait(1).then(() => {
          setTransactionPending(false);
          setSuccess(true);
        });
      }
    };

    const changeHandlerModal = async (e) => {
      setInputVal(e);
      mutateNewCollectionContract();
    };

    if(transactionPending){
      return (
        <>
          <div className='flex mb-10 items-center'>
            <ArrowsClockwise size={32} color="#6f6f6f" weight="fill" className='mr-2 animate-spin-slow' />
            <h2 className='text-4xl tracking-wide font-bold'>One second...</h2>
          </div>
          <p className='text-[#6F6F6F]'>We’re waiting for the transaction to complete.</p>
        </>
      );
    }

    if(changeCollection){
      return (
        <>
          <h2 className='text-4xl tracking-wide font-bold mb-10'>Change Collection</h2>

          <p className='mt-2 mb-4 text-[#6F6F6F]'>Enter the new address of the NFT collection you want to display on your profile.</p>
          <SettingsForm submitHandler={async () => {
            setChangeCollection(false);
            await lookupCollectionName(inputVal)
              .then((res) => {
                setVisible(true);
                setCollectionNameModal(res?.contractMetadata?.name);
                setLookupInProgress(true);
              });
          }} buttonText='Change Collection' inputVal={inputVal} changeHandler={changeHandlerModal} isAssociatedOrPending={isAssociated} />
        </>
      );
    }

    if(notAuthorized){
      return (
        <>
          <h2 className='text-4xl tracking-wide font-bold mb-10'>Not Authorized</h2>

          <p className='mt-2 text-[#6F6F6F]'>It looks like the collection was not deployed by a address associated to your profile.</p>
          <p className='text-[#6F6F6F] mt-3 mb-6'>Please associate the deployer address or try another collection address.</p>
          <Button
            type={ButtonType.PRIMARY}
            size={ButtonSize.LARGE}
            onClick={() => {setVisible(false); setNotAuthorized(false); setLookupInProgress(true); setInputVal(''); setCollectionNameModal('');}}
            stretch
            label='Return to Settings'
          />
        </>
      );
    }

    if(!lookupInProgress && !success){
      return (
        <>
          <h2 className='text-4xl tracking-wide font-bold mb-10'>Confirm Collection</h2>
          <p className='font-mono text-black text-xl break-words mt-2'>{inputVal}</p>

          <p className='mt-2 text-[#6F6F6F]'>
            The address you have entered represents
            <span className='text-black font-bold'>
              {collectionName === '' ? inputVal : collectionNameModal}
            </span>
          </p>
          <p className='text-[#6F6F6F] my-6'>
            Please confirm this is the collection you want to display on your profile. Displaying this collection will require you to authorize a transaction in your wallet.
          </p>
          <Button
            type={ButtonType.PRIMARY}
            size={ButtonSize.LARGE}
            label='Display Collection'
            onClick={() => submitHandler()}
            stretch
          />

          <div className='flex items-center font-noi-grotesk text-blog-text-reskin justify-center mt-2 text-sm'>
            <GasPump size={20} weight="fill" />
            <p className='ml-1'>This action will require a <span className='border-dashed	border-b border-[#6F6F6F]'>gas fee.</span></p>
          </div>
        </>
      );
    }

    if(success) {
      return (
        <>
          <h2 className='text-4xl tracking-wide font-bold mb-10'>Success!</h2>
          <p className='font-mono text-black text-xl break-words mt-2'>{inputVal}</p>

          <p className='mt-2 text-[#6F6F6F]'>Your collection will now display on your NFT profile.</p>
          <p className='text-[#6F6F6F] my-6'>You can always change the collection anytime by visiting your profile’s settings.</p>
          <Button
            size={ButtonSize.LARGE}
            type={ButtonType.PRIMARY}
            label='Return to Settings'
            onClick={() => {setVisible(false); setSuccess(false); setLookupInProgress(true); setInputVal('');}}
            stretch
          />
        </>
      );}

    return (
      <>
        <div className='flex mb-10 items-center'>
          <ArrowsClockwise size={32} color="#6f6f6f" weight="fill" className='mr-2 animate-spin' />
          <h2 className='text-4xl tracking-wide font-bold'>One second...</h2>
        </div>
        <p className='mt-2 text-[#6F6F6F] mb-10'>We’re making sure everything looks good on our end.</p>
      </>
    );
  }, [success, inputVal, notAuthorized, collectionName, lookupInProgress, nftResolver, selectedProfile, changeCollection, mutateNewCollectionContract, collectionNameModal, isAssociated, transactionPending]);

  return (
    <>
      <div className='mt-10 font-noi-grotesk w-full'>
        <h3 className='text-blog-text-reskin text-base font-semibold tracking-wide mb-1'>
          {connectedCollection?.chainAddr && data && !loading ?
            'Selected NFT Collection'
            :
            'Select NFT Collection'
          }
        </h3>
        <p className='text-blog-text-reskin mb-4'>
          {connectedCollection?.chainAddr && data && !loading ?
            'Your NFT Profile is displaying this collection.'
            :
            'Enter a collection address.'
          }
        </p>

        {
          !connectedCollection?.chainAddr ||
          !associatedAddresses?.some(addr => sameAddress(addr?.chainAddr, data?.associatedAddressesForContract?.deployerAddress)) && !loading && !sameAddress(currentAddress, data?.associatedAddressesForContract?.deployerAddress)
            ? <SettingsForm isAssociatedOrPending={isAssociated} submitHandler={openModal} buttonText='Display Collection' inputVal={inputVal} changeHandler={changeHandler} />
            : null
        }

        {connectedCollection?.chainAddr && data && !loading
          ?
          <div className='mt-4 w-full'>
            <AssociatedProfile
              isCollection
              isRemoved={
                !associatedAddresses?.some(addr => sameAddress(addr?.chainAddr, data?.associatedAddressesForContract?.deployerAddress)) && !sameAddress(currentAddress, currentAddress)
              }
              profile={{
                url: collectionName || connectedCollection.chainAddr,
                addr: connectedCollection.chainAddr
              }}
              remove={removeHandler}
            />
          </div>
          :
          !isNullOrEmpty(connectedCollection?.chainAddr) &&
          <div className='mt-4 md:w-full w-3/4'>
            <p>Loading...</p>
          </div>
        }
      </div>

      <Modal
        visible={visible}
        loading={false}
        title={''}
        onClose={() => {
          setVisible(false);
          setInputVal('');
          setLookupInProgress(true);
          setNotAuthorized(false);
          setCollectionNameModal('');
        }}
        bgColor='white'
        hideX
        fullModal
        pure
      >
        <div className='max-w-full minlg:max-w-[458px] h-screen minlg:h-max maxlg:h-max bg-white text-left px-4 pb-10 rounded-none minlg:rounded-[10px] minlg:mt-24 minlg:m-auto'>
          <div className='pt-28 font-noi-grotesk lg:max-w-md max-w-lg m-auto minlg:relative'>
            <div className='absolute top-4 right-4 minlg:right-1 hover:cursor-pointer w-6 h-6 bg-[#F9D963] rounded-full'></div>
            <XCircle
              onClick={() => {
                setVisible(false);
                setLookupInProgress(true);
                setInputVal('');
                setNotAuthorized(false);
              }} className='absolute top-3 right-3 minlg:right-0 hover:cursor-pointer' size={32} color="black" weight="fill" />
            {getModalContent()}
          </div>
        </div>
      </Modal>
    </>
  );
}
