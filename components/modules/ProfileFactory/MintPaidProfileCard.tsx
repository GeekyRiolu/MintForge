import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import ClientOnly from 'components/elements/ClientOnly';
import CustomTooltip from 'components/elements/CustomTooltip';
import MintProfileModal from 'components/modules/ProfileFactory/MintProfileModal';
import maxProfilesABI from 'constants/abis/MaxProfiles.json';
import { useNftQuery } from 'graphql/hooks/useNFTQuery';
import { useProfileTokenQuery } from 'graphql/hooks/useProfileTokenQuery';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useEthPriceUSD } from 'hooks/useEthPriceUSD';
import { useGetProfileClaimHash } from 'hooks/useProfileClaimHash';
import { isNullOrEmpty } from 'utils/format';
import { getAddress } from 'utils/httpHooks';
import { tw } from 'utils/tw';

import MintProfileInputField from './MintProfileInputField';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import { BigNumber, utils } from 'ethers';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Info, MinusCircle, PlusCircle } from 'phosphor-react';
import ErrorIcon from 'public/icons/red-error-icon.svg?svgr';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { useAccount, usePrepareContractWrite, useProvider } from 'wagmi';

type MintPaidProfileCardProps = {
  type: 'renew' | 'mint';
  profile?: string;
}

const DynamicMintProfileModal = dynamic<React.ComponentProps<typeof MintProfileModal>>(() => import('components/modules/ProfileFactory/MintProfileModal').then(mod => mod.default));

export default function MintPaidProfileCard({ type, profile } : MintPaidProfileCardProps) {
  const [profileURI, setProfileURI] = useState(null);
  const [input, setInput] = useState([]);
  const [profileStatus, setProfileStatus] = useState('');
  const [hasListings, setHasListings] = useState(false);
  const [registrationFee, setRegistrationFee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState(null);
  const { address: currentAddress } = useAccount();
  const { profileTokenId } = useProfileTokenQuery(profileURI || '');
  const defaultChainId = useDefaultChainId();
  const { data: nft } = useNftQuery(getAddress('nftProfile', defaultChainId), profileTokenId?._hex);
  const { profileClaimHash, mutate: mutateProfileClaimHash } = useGetProfileClaimHash(profileURI);
  const [yearValue, setYearValue] = useState(1);
  const contractAddress = getAddress('maxProfiles', defaultChainId);
  const provider = useProvider();
  const ethPriceUSD = useEthPriceUSD();
  const { profileAuction } = useAllContracts();
  const { openConnectModal } = useConnectModal();

  const setMintingModal = useCallback((isOpen) => {
    if(isOpen){
      setMinting(true);
      setModalOpen(true);
    } else {
      setMinting(false);
      setModalOpen(false);
    }
  }, []);

  const { data: feeData } = useSWR(
    `eth_est_${profileURI}`,
    async () => {
      const feeData = await provider.getFeeData();
      return feeData;
    });

  const { data } = usePrepareContractWrite({
    address: contractAddress as `0x${string}`,
    abi: maxProfilesABI,
    functionName: type === 'mint' ? 'publicMint' : 'extendLicense',
    args: type === 'mint' ?
      [
        input[0]?.profileURI,
        yearValue * 60 * 60 * 24 * 365,
        0,
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        input[0]?.hash,
        input[0]?.signature
      ] :
      [
        profile,
        yearValue * 60 * 60 * 24 * 365,
        0,
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ],
    onSuccess() {
      setError(null);
    },
    onError(err){
      err.message.includes('insufficient funds') ? setError('Insufficient funds for transaction') : console.log(err);
    },
    overrides: {
      from: currentAddress,
      value: registrationFee && registrationFee,
    },
    enabled:  type === 'mint' ? !isNullOrEmpty(profileURI) && !isNullOrEmpty(currentAddress) : true
  });

  useEffect(() => {
    if(!isNullOrEmpty(currentAddress)){
      mutateProfileClaimHash();
    }
  }, [currentAddress, mutateProfileClaimHash]);

  const getMintCost = useCallback(() => {
    if (feeData?.gasPrice){
      if (data?.request.gasLimit && registrationFee) {
        const gasFee = BigNumber.from(data?.request?.gasLimit.toString()).mul(BigNumber.from(feeData?.gasPrice.toString()));
        return utils.formatEther(BigNumber.from(registrationFee).add(gasFee));
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }, [feeData, data, registrationFee]);

  useEffect(() => {
    if(profileStatus === 'Listed') {
      setHasListings(true);
    } else {
      setHasListings(false);
    }
    if(isNullOrEmpty(profileURI) || profileURI === ''){
      setInput([]);
    } else {
      setInput([{
        profileURI,
        profileStatus,
        type: 'input-Paid',
        hash: profileClaimHash?.hash,
        signature: profileClaimHash?.signature
      }]);
    }
  }, [profileURI, profileStatus, profileClaimHash]);

  useEffect(() => {
    setProfileStatus(profileTokenId ? nft?.listings?.totalItems > 0 ? 'Listed' : 'Owned' : 'Available');
  }, [profileTokenId, nft]);

  useEffect(() => {
    (async () => {
      const [
        regFee
      ] = await Promise.all([
        profileAuction.getFee(type === 'mint' ? profileURI : profile, yearValue * 60 * 60 * 24 * 365).catch(() => null)
      ]);

      if(!isNullOrEmpty(regFee)){
        setRegistrationFee(regFee);
      }
    })();
  }, [profileAuction, profileURI, yearValue, profile, type]);

  const updateProfileValue = useCallback((input) => {
    setError(null);
    setProfileURI(input);
  }, []);

  return (
    <>
      <>
        {type === 'mint' &&
          <>
            <div className='mt-9 mb-4 text-xl'>
              <span >
              Choose Your Profile Name
                <div className='w-max inline-block absolute pl-1 bottom-.5'>
                  <CustomTooltip
                    orientation='top'
                    tooltipComponent={
                      <div
                        className="rounded-xl w-max"
                      >
                        <p className='max-w-[150px]'>An annual fee is required to register a NFT Profile. The fee is based on the length of the domain. You can pre-pay this fee at creation of the NFT Profile and extend it at any time.</p>
                      </div>
                    }
                  >
                    <Info size={25} color="#969696" weight="fill" />
                  </CustomTooltip>
                </div>
              </span>
            </div>
            <p className='text-[#707070] font-normal mb-2 relative'>
              Specify your profile name and duration. Don’t worry, you can extend the duration at any time through the settings page.
            </p>

            <MintProfileInputField
              minting={minting}
              setFreeProfile={updateProfileValue}
              name={'input-Paid'}
              type="Free"
            />
          </>
        }
        <div className={tw(
          type === 'mint' ? 'mt-8' : 'mt-4'
        )}>
          <div className='mb-10 font-noi-grotesk'>
            {type === 'renew' &&
              <div className='flex items-center space-x-1 mb-3'>
                <h3 className='text-[22px] font-medium'>Renew</h3>
              </div>
            }
            {type ==='renew' && <p className='text-[#707070] font-normal'>Pre-pay your annual license to maintain ownership of your NFT Profile</p>}
            <div className='mt-10 flex justify-between items-center pr-0 pl-0 minmd:pr-14 minmd:pl-8'>
              <div className='rounded-full w-max py-1 px-4 flex space-x-3 border border-[#B2B2B2] items-center'>
                <div className='relative'>
                  <MinusCircle size={25} color="#F8F8F8" weight="fill" className='relative z-10 hover:cursor-pointer' onClick={() => yearValue > 1 && setYearValue(yearValue - 1)} />
                  <div className='bg-black w-3 h-3 absolute top-2 left-2 rounded-full'></div>
                </div>
                <p className='text-2xl'>{yearValue}</p>
                <div className='relative'>
                  <PlusCircle size={25} color="#F8F8F8" weight="fill" className='relative z-10 hover:cursor-pointer' onClick={() => setYearValue(yearValue + 1)} />
                  <div className='bg-black w-3 h-3 absolute top-2 left-2 rounded-full'></div>
                </div>
                <p className='border-l pl-2'>Years</p>
              </div>
              <p className='text-[40px]'>=</p>
              <p className='text-xl'>{registrationFee ? utils.formatEther(BigNumber.from(registrationFee)) : 0.03 * yearValue } ETH</p>
            </div>
            <div className='flex items-center justify-between pr-0 pl-2 minmd:pr-12 minmd:pl-14'>
              <p className='text-[#B2B2B2] font-normal'>Profile Duration</p>
              <p className='text-[#B2B2B2] font-normal'>Duration Price</p>
            </div>
            <div className='rounded-2xl bg-[#F2F2F2] px-7 py-5 flex items-center justify-between mt-8 font-noi-grotesk'>
              {isNullOrEmpty(error) ?
                <>
                  <p className='font-normal'>Estimated Total (Price + Gas)</p>
                  <p className='font-medium text-xl'>~ {parseFloat(Number(getMintCost()).toFixed(5))} ETH <span className='font-normal text-base text-[#686868]'>(${(ethPriceUSD * Number(getMintCost())).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span></p>
                </>
                :
                <div className='px-2 min-h-[3rem] border border-[#E43D20] max-h-[5rem] w-full bg-[#FFF8F7] text-[#E43D20] flex items-center font-medium font-noi-grotesk rounded'>
                  <ErrorIcon className='relative shrink-0 mr-2' />
                  {error}
                </div>
              }
            </div>
          </div>

          {hasListings ?
            <Link href={`/app/nft/0x98ca78e89Dd1aBE48A53dEe5799F24cC1A462F2D/${profileTokenId?.toNumber()}`}>
              <Button
                label='View NFT.com listing'
                type={ButtonType.PRIMARY}
                size={ButtonSize.XLARGE}
                stretch
                onClick={() => null}
              />
            </Link>
            :
            <ClientOnly>
              <Button
                type={ButtonType.PRIMARY}
                size={ButtonSize.XLARGE}
                loading={minting}
                stretch
                label={isNullOrEmpty(currentAddress)
                  ? 'Connect Wallet' :
                  type === 'mint' ?
                    'Purchase' :
                    'Renew License'
                }
                disabled={ type === 'mint' ? input.some(item => item.profileStatus === 'Owned') || isNullOrEmpty(input) || input.some(item => item.profileURI === '') || !isNullOrEmpty(error) : !isNullOrEmpty(error) }
                onClick={async () => {
                  if (
                    minting
                  ) {
                    return;
                  }
                  if(isNullOrEmpty(currentAddress)){
                    openConnectModal();
                    return;
                  }
                  setModalOpen(true);
                  setMinting(true);
                }}
              />
            </ClientOnly>
          }
        </div>
        <Link href='https://docs.nft.com/nft-profiles/what-is-a-nft-profile' passHref className='mt-4' legacyBehavior>
          <a target="_blank" >
            <p className='text-[#727272] text-left minlg:text-center mt-4 text-xl minlg:text-base font-normal'>
            Learn more about <span className='text-black inline font-medium'>NFT Profiles</span>
            </p>
          </a>
        </Link>
      </>
      {modalOpen && <DynamicMintProfileModal isOpen={modalOpen} setIsOpen={setMintingModal} profilesToMint={type === 'mint' ? input : [{ profileURI: profile }]} type={type === 'mint' ? 'Paid' : 'Renew'} duration={yearValue} transactionCost={registrationFee} />}
    </>
  );
}
