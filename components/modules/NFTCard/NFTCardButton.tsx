
import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { NFTPurchasesContext } from 'components/modules//Checkout/NFTPurchaseContext';
import { DetailedNft } from 'components/modules/DiscoveryCards/CollectionCard';
import { getAddressForChain, nftAggregator } from 'constants/contracts';
import { WETH } from 'constants/tokens';
import { AuctionType, LooksrareProtocolData, NftcomProtocolData, SeaportProtocolData, TxActivity, X2Y2ProtocolData } from 'graphql/generated/types';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useGetCurrentDate } from 'hooks/useGetCurrentDate';
import { useGetERC20ProtocolApprovalAddress } from 'hooks/useGetERC20ProtocolApprovalAddress';
import { NFTSupportedCurrency } from 'hooks/useSupportedCurrencies';
import { ExternalProtocol } from 'types';
import { getListingCurrencyAddress, getListingPrice } from 'utils/listingUtils';

import { BigNumber } from 'ethers';
import { useContext } from 'react';
import { PartialDeep } from 'type-fest';
import { PartialObjectDeep } from 'type-fest/source/partial-deep';
import { useAccount } from 'wagmi';

export interface NFTCardButtonProps {
  contractAddr: string;
  collectionName: string;
  tokenId: string;
  bestListing: PartialObjectDeep<TxActivity, unknown>;
  currencyData: NFTSupportedCurrency;
  listings?: PartialDeep<TxActivity>[];
  nft?: PartialDeep<DetailedNft>;
}

export function NFTCardButton(props: NFTCardButtonProps) {
  const { stageBuyNow, togglePurchaseSummaryModal } = useContext(NFTPurchasesContext);
  const { address: currentAddress } = useAccount();
  const currentDate = useGetCurrentDate();
  const chainId = useDefaultChainId();

  const getERC20ProtocolApprovalAddress = useGetERC20ProtocolApprovalAddress();

  return (
    <div className='w-full overflow-hidden rounded-b-2xl'>
      <div className='-ml-2 -mr-2'>
        <Button stretch label='Buy Now' type={ButtonType.PRIMARY} size={ButtonSize.LARGE}
          onClick={async (e) => {
            e.preventDefault();
            const allowance = await props?.currencyData.allowance(currentAddress, getAddressForChain(nftAggregator, chainId));
            const protocolAllowance = await props?.currencyData.allowance(currentAddress, getERC20ProtocolApprovalAddress(props?.bestListing?.order?.protocol as ExternalProtocol));
            const price = getListingPrice(props?.bestListing, (props?.bestListing?.order?.protocolData as NftcomProtocolData).auctionType === AuctionType.Decreasing ? currentDate : null);
            const protocol = props?.bestListing?.order?.protocol as ExternalProtocol;
            stageBuyNow({
              nft: props?.nft,
              activityId: props?.bestListing?.id,
              currency: getListingCurrencyAddress(props?.bestListing) ?? WETH.address,
              price: price,
              collectionName: props.collectionName,
              protocol: protocol,
              isERC20ApprovedForAggregator: BigNumber.from(allowance ?? 0).gt(price),
              isERC20ApprovedForProtocol: BigNumber.from(protocolAllowance ?? 0).gt(price),
              orderHash: props?.bestListing?.order?.orderHash,
              makerAddress: props?.bestListing?.order?.makerAddress,
              takerAddress: props?.bestListing?.order?.takerAddress,
              nonce: props?.bestListing?.order?.nonce,
              protocolData: props?.bestListing?.order?.protocol === ExternalProtocol.Seaport ?
                props?.bestListing?.order?.protocolData as SeaportProtocolData :
                props?.bestListing?.order?.protocol === ExternalProtocol.X2Y2 ?
                  props?.bestListing?.order?.protocolData as X2Y2ProtocolData:
                  props?.bestListing?.order?.protocolData as LooksrareProtocolData
            });
            togglePurchaseSummaryModal();
          }}
        />
      </div>
    </div>
  );
}

