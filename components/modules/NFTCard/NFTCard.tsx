import LikeCount from 'components/elements/LikeCount';
import { DetailedNft } from 'components/modules/DiscoveryCards/CollectionCard';
import { WETH } from 'constants/tokens';
import { LikeableType, TxActivity } from 'graphql/generated/types';
import { useNftLikeQuery } from 'graphql/hooks/useNFTLikeQuery';
import { useNftQuery } from 'graphql/hooks/useNFTQuery';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useEthPriceUSD } from 'hooks/useEthPriceUSD';
import { useSupportedCurrencies } from 'hooks/useSupportedCurrencies';
import { isNullOrEmpty } from 'utils/format';
import { getGenesisKeyThumbnail, sameAddress } from 'utils/helpers';
import { getAddress } from 'utils/httpHooks';
import { getListingCurrencyAddress, getLowestPriceListing } from 'utils/listingUtils';
import { filterValidListings } from 'utils/marketplaceUtils';
import { tw } from 'utils/tw';

import { NFTCardButton } from './NFTCardButton';
import { NFTCardDescription } from './NFTCardDescription';
import { NFTCardEditMode } from './NFTCardEditMode';
import { NFTCardImage } from './NFTCardImage';

import { useRouter } from 'next/router';
import { PartialDeep } from 'type-fest';
import { useAccount } from 'wagmi';
export interface NftCardProps {
  name: string;
  images: Array<string | null>;
  collectionName: string;
  contractAddr: string;
  tokenId: string;
  redirectTo: string;

  listings?: PartialDeep<TxActivity>[];
  nft?: PartialDeep<DetailedNft>;
  isOwnedByMe?: boolean;
  visible?: boolean | null;
  onVisibleToggle?: (visible: boolean) => void;
  onClick?: () => void;
  descriptionVisible?: boolean;
  preventDefault?: boolean;
}

export function NFTCard(props: NftCardProps) {
  const {
    name,
    images,
    contractAddr,
    tokenId,
    redirectTo,
    listings,
    nft,
    isOwnedByMe,
    visible,
    onClick,
    descriptionVisible,
    preventDefault
  } = props;
  const { address: currentAddress } = useAccount();
  const defaultChainId = useDefaultChainId();
  const chainId = useDefaultChainId();
  const ethPriceUSD = useEthPriceUSD();
  const { getByContractAddress } = useSupportedCurrencies();

  const router = useRouter();
  const { profileURI } = router.query;
  const processedProfileURI = profileURI?.toString().toLowerCase();
  const isMatchingCurrentProfilePage = processedProfileURI === nft?.metadata?.name;

  const { data: nftData } = useNftQuery(contractAddr, (listings?.length || nft) ? null : tokenId); // skip query if listings are passed, or if nft is passed by setting tokenId to null
  //if nft card matches current profile slug, this query is used to keep card and profile like count in sync
  const { data: nftLikeData, mutate: mutateNftLike } = useNftLikeQuery(isMatchingCurrentProfilePage ? contractAddr : null, tokenId);

  const isAddressValid = sameAddress(contractAddr, getAddress('genesisKey', defaultChainId)) && !isNullOrEmpty(tokenId);
  const processedImageURLs = isAddressValid ?
    [getGenesisKeyThumbnail(tokenId)]
    : images.length > 0 ? images : [nftData?.metadata?.imageURL];
  const bestListing = getLowestPriceListing(filterValidListings(listings ?? nftData?.listings?.items), ethPriceUSD, chainId);
  const isOwnedByUser = isOwnedByMe || (nft?.wallet?.address ?? nft?.owner) === currentAddress;
  const currencyData = getByContractAddress(getListingCurrencyAddress(bestListing) ?? WETH.address);

  return (
    <div className='relative w-full h-full'>
      {visible !== true && visible !== false &&
        <div className='absolute top-4 right-4 z-50'>
          <LikeCount
            count={isMatchingCurrentProfilePage ? nftLikeData?.likeCount : nft?.likeCount ?? nftData?.likeCount}
            isLiked={isMatchingCurrentProfilePage ? nftLikeData?.isLikedBy :nft?.isLikedBy ?? nftData?.isLikedBy}
            likeData={{
              id: nftData?.id ?? nft?.id,
              type: LikeableType.Nft
            }}
            mutate={isMatchingCurrentProfilePage && mutateNftLike}
          />
        </div>
      }

      <div className={tw(
        'group/ntfCard transition-all cursor-pointer rounded-2xl shadow-xl relative w-full h-full minmd:mb-0 overflow-visible',
        descriptionVisible != false ? '' : 'h-max'
      )}>
        <NFTCardEditMode {...props} />
        <a
          href={redirectTo && redirectTo !== '' ? redirectTo : '#'}
          onClick={(e) => {
            e.stopPropagation();
            preventDefault && e.preventDefault();
            gtag('event', `${visible ? 'Hide' : 'Show'} Single NFT`, {
              ethereumAddress: currentAddress,
              title: name,
              processedImageURLs: processedImageURLs?.[0]
            });
            onClick && onClick();
          }}
        >
          <div className={tw(
            'relative object-cover w-full h-max flex flex-col',
            !bestListing && descriptionVisible && 'mb-10'
          )}>
            <NFTCardImage {...props} bestListing={bestListing} nft={nftData} isOwnedByMe={isOwnedByUser} currencyData={currencyData} />
            {descriptionVisible != false &&
              <NFTCardDescription {...props} bestListing={bestListing} nft={{ ...nftData, isGKMinted: nft?.isGKMinted ?? nftData?.isGKMinted }} currencyData={currencyData} />
            }
            {(listings?.length || nftData?.listings?.items?.length) && bestListing && descriptionVisible !== false && !isOwnedByUser ?
              <NFTCardButton {...props} bestListing={bestListing} nft={nftData} currencyData={currencyData} />
              : null
            }
          </div>
        </a>
      </div>
    </div>
  );
}
