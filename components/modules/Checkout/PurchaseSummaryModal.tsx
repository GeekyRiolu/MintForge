import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { Modal } from 'components/elements/Modal';
import { NotificationContext } from 'components/modules/Notifications/NotificationContext';
import { NULL_ADDRESS } from 'constants/addresses';
import { getAddressForChain, nftAggregator } from 'constants/contracts';
import { ActivityStatus, Maybe } from 'graphql/generated/types';
import { useMyNFTsQuery } from 'graphql/hooks/useMyNFTsQuery';
import { useProfileNFTsQuery } from 'graphql/hooks/useProfileNFTsQuery';
import { useProfileQuery } from 'graphql/hooks/useProfileQuery';
import { useSaveUserActionForBuyNFTsMutation } from 'graphql/hooks/useSaveUserActionForBuyNFTs';
import { useUpdateActivityStatusMutation } from 'graphql/hooks/useUpdateActivityStatusMutation';
import { useLooksrareStrategyContract } from 'hooks/contracts/useLooksrareStrategyContract';
import { useUser } from 'hooks/state/useUser';
import { useGetERC20ProtocolApprovalAddress } from 'hooks/useGetERC20ProtocolApprovalAddress';
import { useHasGk } from 'hooks/useHasGk';
import { useMyNftProfileTokens } from 'hooks/useMyNftProfileTokens';
import { useNftComRoyalties } from 'hooks/useNftComRoyalties';
import useNFTPurchaseError, { PurchaseErrorResponse } from 'hooks/useNFTPurchaseError';
import { useSupportedCurrencies } from 'hooks/useSupportedCurrencies';
import { Doppler, getEnv } from 'utils/env';
import { filterDuplicates, filterNulls, isNullOrEmpty, } from 'utils/format';
import { sameAddress } from 'utils/helpers';
import { useBuyNow } from 'utils/marketplaceHelpers';
import { getErrorText, getTotalFormattedPriceUSD, getTotalMarketplaceFeesUSD, getTotalRoyaltiesUSD, needsERC20Approvals } from 'utils/marketplaceUtils';

import { CheckoutSuccessView, SuccessType } from './CheckoutSuccessView';
import { NFTPurchasesContext } from './NFTPurchaseContext';
import { ProgressBarItem, VerticalProgressBar } from './VerticalProgressBar';

import { useRouter } from 'next/router';
import { CheckCircle, SpinnerGap, X } from 'phosphor-react';
import { useCallback, useContext, useState } from 'react';
import useSWR from 'swr';
import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi';

export interface PurchaseSummaryModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PurchaseSummaryModal(props: PurchaseSummaryModalProps) {
  const {
    toBuy,
    buyAll,
    updateCurrencyApproval,
    clear,
    clearBuyNow,
    toBuyNow,
    buyNowActive
  } = useContext(NFTPurchasesContext);

  const { address: currentAddress } = useAccount();
  const { chain } = useNetwork();
  const router = useRouter();
  const { data: signer } = useSigner();
  const { updateActivityStatus } = useUpdateActivityStatusMutation();
  const provider = useProvider();
  const { data: nftComRoyalties } = useNftComRoyalties(toBuy, true);
  const looksrareStrategy = useLooksrareStrategyContract(provider);
  const { buyNow } = useBuyNow(signer);
  const { profileTokens: myOwnedProfileTokens } = useMyNftProfileTokens();
  const hasGk = useHasGk();
  const purchaseError = useNFTPurchaseError();
  const { getByContractAddress } = useSupportedCurrencies();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<Maybe<PurchaseErrorResponse['error']>>(null);
  const { saveUserActionForBuyNFTs } = useSaveUserActionForBuyNFTsMutation();
  const { mutatePurchaseActivities } = useContext(NotificationContext);

  const { user } = useUser();
  const { profileData } = useProfileQuery(user.currentProfileUrl);

  const { data: looksrareProtocolFeeBps } = useSWR(
    'LooksrareProtocolFeeBps' + String(looksrareStrategy == null),
    async () => {
      return await looksrareStrategy.viewProtocolFee();
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    });

  const {
    mutate: mutatePublicProfileNfts,
  } = useProfileNFTsQuery({
    profileId: profileData?.profile?.id,
    chainId: String(chain?.id || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)),
    first: 8
  });

  const {
    mutate: mutateAllOwnerNfts,
  } = useMyNFTsQuery({ first: 8, profileId: profileData?.profile?.id, query: '', invalidateCache: true });

  const nftsToBuy = buyNowActive ? toBuyNow : toBuy;
  const getERC20ProtocolApprovalAddress = useGetERC20ProtocolApprovalAddress();

  const getNeedsApprovals = useCallback(() => {
    return needsERC20Approvals(nftsToBuy);
  }, [nftsToBuy]);

  const getTotalPriceUSD = useCallback(() => {
    return getTotalFormattedPriceUSD(nftsToBuy, getByContractAddress);
  }, [nftsToBuy, getByContractAddress]);

  const getTotalMarketplaceFees = useCallback(() => {
    return getTotalMarketplaceFeesUSD(nftsToBuy, looksrareProtocolFeeBps, getByContractAddress, hasGk);
  }, [nftsToBuy, looksrareProtocolFeeBps, getByContractAddress, hasGk]);

  const getTotalRoyalties = useCallback(() => {
    return getTotalRoyaltiesUSD(nftsToBuy, looksrareProtocolFeeBps, getByContractAddress, nftComRoyalties);
  }, [getByContractAddress, looksrareProtocolFeeBps, nftsToBuy, nftComRoyalties]);

  const getSummaryContent = useCallback(() => {
    if (success) {
      return <CheckoutSuccessView
        onClose={() => {
          setSuccess(false);
          setLoading(false);
          setError(null);
          clearBuyNow();
          mutatePurchaseActivities();
          props.onClose();
        }}
        userAddress={currentAddress}
        type={SuccessType.Purchase}
        subtitle={`Congratulations! You have successfully purchased ${nftsToBuy?.length} NFT${nftsToBuy.length > 1 ? 's' : ''}`}
      />;
    } else if (!isNullOrEmpty(error)) {
      return <div className='flex flex-col w-full'>
        <div className="text-3xl mx-4 font-bold">
          {error === 'ApprovalError' ? 'Approval' : 'Transaction'} Failed
          <div className='w-full my-8'>
            <span className='font-medium text-[#6F6F6F] text-base'>
              {error && getErrorText(error)}
            </span>
          </div>
        </div>
      </div>;
    } if (loading) {
      const tokens = filterDuplicates(
        toBuy?.filter(purchase => !sameAddress(NULL_ADDRESS, purchase?.currency)),
        (first, second) => first?.currency === second?.currency
      );
      return (<div className='flex flex-col w-full pt-3'>
        <p className="text-3xl mx-4 font-bold">
            Purchase Progress
        </p>
        <div className='w-full m-8'>
          <VerticalProgressBar
            nodes={filterNulls([
              {
                label: 'Initialize Wallet',
              },
              isNullOrEmpty(tokens) ?
                null :
                {
                  label: 'Approve Tokens',
                  error: error === 'ApprovalError',
                  items: tokens?.map(purchase => {
                    const currencyData = getByContractAddress(purchase?.currency);
                    return {
                      label: 'Approve ' + currencyData.name,
                      endIcon: purchase?.isERC20ApprovedForAggregator ?
                        <CheckCircle size={16} className="text-green-500 mx-2" /> :
                        error === 'ApprovalError' ?
                          <X size={16} className="text-red-400 mx-2" /> :
                          <SpinnerGap size={16} className="text-yellow-500 animate-spin mx-2" />
                    } as ProgressBarItem;
                  })
                },
              {
                label: 'Complete Transaction',
                error: error === 'PurchaseUnknownError' || error === 'PurchaseBalanceError',
              }
            ])}
            activeNodeIndex={getNeedsApprovals() || isNullOrEmpty(tokens) || error === 'ApprovalError' ? 1 : success ? 3 : 2}
          />
        </div>
      </div>);
    } else {
      // Cost Summary, Default view
      return (
        <div className="flex flex-col w-full pt-3">
          <p className="text-3xl mx-4 font-bold">
            Fee Summary
          </p>
          <p className='text-2xl text-[#6F6F6F] mx-4 font-bold'>
            {nftsToBuy ?.length ?? 0} NFT{nftsToBuy ?.length > 1 && 's'}
          </p>
          <div className="mx-4 my-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className='font-semibold'>Total NFT Price</span>
              <span className='font-medium text-[#6F6F6F] text-sm'>
                Estimated Amount
              </span>
            </div>
            <div className="flex flex-col align-end">
              <span className='font-semibold'>{'$' + (Number(getTotalPriceUSD()) - Number(getTotalRoyalties()) - Number(getTotalMarketplaceFees()))?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
            </div>
          </div>
          <div className="mx-4 my-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className='font-semibold'>Marketplace Fees</span>
              <span className='font-medium text-[#6F6F6F] text-sm'>
                Estimated Amount
              </span>
            </div>
            <div className="flex flex-col align-end">
              <span className='font-semibold'>{'$' + getTotalMarketplaceFees()?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
            </div>
          </div>
          <div className="mx-4 my-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className='font-semibold'>Creator Royalties</span>
              <span className='font-medium text-[#6F6F6F] text-sm'>
                Estimated Amount
              </span>
            </div>
            <div className="flex flex-col align-end">
              <span className='font-semibold'>{'$' + getTotalRoyalties()?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
            </div>
          </div>
          <div className="mx-4 my-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className='font-semibold'>Total Price</span>
              <span className='font-medium text-[#6F6F6F] text-sm'>
                Estimated Amount
              </span>
            </div>
            <div className="flex flex-col align-end">
              <span className='font-semibold'>${Number(getTotalPriceUSD())?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
            </div>
          </div>
        </div>
      );
    }
  }, [clearBuyNow, currentAddress, error, getByContractAddress, getNeedsApprovals, getTotalMarketplaceFees, getTotalPriceUSD, getTotalRoyalties, loading, mutatePurchaseActivities, nftsToBuy.length, props, success, toBuy]);

  return (
    <Modal
      visible={props.visible}
      loading={false}
      title={''}
      onClose={() => {
        if (success && !router.pathname.includes('/nft/')) router.push(`/app/nft/${nftsToBuy?.[0]?.nft?.contract}/${nftsToBuy?.[0]?.nft?.tokenId}`);
        setSuccess(false);
        setLoading(false);
        setError(null);
        clear();
        clearBuyNow();
        mutatePublicProfileNfts();
        mutateAllOwnerNfts();
        props.onClose();
      }}
      bgColor='white'
      hideX
      fullModal
      pure
    >
      <div className={`max-w-full overflow-hidden ${success ? myOwnedProfileTokens?.length == 0 ? 'minlg:max-w-[458px]' : 'minlg:max-w-[700px]' : 'minlg:max-w-[458px] px-4 py-5'} h-screen minlg:h-max maxlg:h-max bg-white text-left rounded-none minlg:rounded-[20px] minlg:mt-24 minlg:m-auto`}>
        <div className={`font-noi-grotesk ${success ? myOwnedProfileTokens?.length == 0 ? 'lg:max-w-md max-w-lg' : 'lg:w-full' : 'pt-3 lg:max-w-md max-w-lg'} m-auto minlg:relative`}>
          <X onClick={() => {
            // non NFT routes
            if (success && !router.pathname.includes('/nft/')) router.push(`/app/nft/${nftsToBuy?.[0]?.nft?.contract}/${nftsToBuy?.[0]?.nft?.tokenId}`);
            setSuccess(false);
            setLoading(false);
            setError(null);
            clear();
            clearBuyNow();
            props.onClose();
          }} className='absolute top-5 right-5 z-50 hover:cursor-pointer closeButton' size={20} color="black" weight="fill" />
          {getSummaryContent()}
          {!success &&
          <Button
            size={ButtonSize.LARGE}
            stretch
            disabled={loading && !error && !success}
            loading={loading && !error && !success}
            label={success ? 'Finish' : error ? 'Try Again' : 'Confirm & Buy'}
            onClick={async () => {
              if (success) {
                clear();
                setSuccess(false);
                clearBuyNow();
                mutatePublicProfileNfts();
                mutateAllOwnerNfts();
                props.onClose();
                return;
              }

              setError(null);
              setSuccess(false);
              setLoading(true);

              if (signer == null) {
                setError('ConnectionError');
                return;
              }

              if (getNeedsApprovals()) {
                const missingApprovals = nftsToBuy.length > 1 ?
                  filterDuplicates(
                    nftsToBuy?.filter(purchase => !sameAddress(NULL_ADDRESS, purchase?.currency)),
                    (first, second) => first?.currency === second?.currency
                  ).filter(purchase => !purchase?.isERC20ApprovedForAggregator) :
                  filterDuplicates(
                    nftsToBuy?.filter(purchase => !sameAddress(NULL_ADDRESS, purchase?.currency)),
                    (first, second) => first?.currency === second?.currency
                  ).filter(purchase => !purchase?.isERC20ApprovedForProtocol);
                for (let i = 0; i < missingApprovals.length; i++) {
                  const purchase = missingApprovals[i];
                  const currencyData = getByContractAddress(purchase?.currency);
                  await currencyData?.setAllowance(currentAddress, nftsToBuy.length > 1 ? getAddressForChain(nftAggregator, chain?.id) : getERC20ProtocolApprovalAddress(nftsToBuy[0].protocol))
                    .then((result: boolean) => {
                      if (!result) {
                        setError('ApprovalError');
                        return;
                      }
                      updateCurrencyApproval(purchase?.currency, true);
                    })
                    .catch(() => {
                      setError('ApprovalError');
                    });
                }
              }

              const result = buyNowActive ? await buyNow(currentAddress, toBuyNow[0]) : toBuy.length > 1 ? await buyAll() : await buyNow(currentAddress, toBuy[0]);

              if (result) {
                setSuccess(true);
                updateActivityStatus(toBuy?.map(stagedPurchase => stagedPurchase.activityId), ActivityStatus.Executed);
                clear();
                clearBuyNow();
                saveUserActionForBuyNFTs(user?.currentProfileUrl);
                mutatePublicProfileNfts();
                mutateAllOwnerNfts();
              } else {
                purchaseError().then((res) => {
                  setError(res);
                }
                );
              }
            }}
            type={ButtonType.PRIMARY} />}
          {
            !isNullOrEmpty(error) &&
            <div className='w-full mt-4'>
              <Button
                size={ButtonSize.LARGE}
                stretch
                label={'Cancel'}
                onClick={() => {
                  setSuccess(false);
                  setLoading(false);
                  setError(null);
                  props.onClose();
                }}
                type={ButtonType.SECONDARY}
              />
            </div>
          }
        </div>
      </div>
    </Modal>
  );
}
