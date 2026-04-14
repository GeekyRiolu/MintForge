import PreloaderImage from 'components/elements/PreloaderImage';
import { CollectionCard } from 'components/modules/DiscoveryCards/CollectionCard';
import { useCollectionLikeCountQuery } from 'graphql/hooks/useCollectionLikeQuery';
import { useSearchModal } from 'hooks/state/useSearchModal';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { tw } from 'utils/tw';

import router from 'next/router';

export const CollectionsResults = (props:
{
  searchTerm?: string,
  found?: number,
  nftsForCollections?: any,
  typesenseCollections?: any,
  sideNavOpen?: boolean
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const { setClearedFilters } = useSearchModal();

  const { searchTerm, found, nftsForCollections, sideNavOpen, typesenseCollections } = props;
  const { data: collectionLikeData } = useCollectionLikeCountQuery(typesenseCollections.map((c) => c?.document?.contractAddr));

  const showCollectionsItems = () => {
    const preloadersArray = screenWidth < 1200 ? [1,2] : sideNavOpen ? [1,2] : [1,2,3];
    if(!nftsForCollections){
      return (
        preloadersArray.map(item => {
          return (
            <div key={item} role="status" className="space-y-8 animate-pulse p-1 last:ml-0 minmd:p-0">
              <div className="flex justify-center items-center bg-gray-300 rounded-[6px] overflow-hidden full-width dark:bg-gray-700">
                <PreloaderImage/>
              </div>
            </div>
          );
        })
      );
    } else {
      return typesenseCollections?.slice(0, screenWidth < 1200 ? 2 : sideNavOpen ? 2 : 3).map((collection, i) => {
        return (<CollectionCard
          key={'collection'+i}
          redirectTo={`/app/collection/${collection.document?.contractAddr}/`}
          collectionId={collection?.document?.id}
          isOfficial={collection.document.isOfficial}
          floorPrice={collection.document?.floor}
          totalVolume={collection.document?.volume}
          images={[collection.document.bannerUrl]}
          contractName={collection.document.contractName}
          contractAddr={collection.document.contractAddr ?? collection.document?.collectionAddress}
          likeInfo={collectionLikeData && collectionLikeData[i]}
        />
        );
      });
    }
  };
  return (
    <>
      <div className="flex justify-between items-center font-noi-grotesk font-black text-sm text-blog-text-reskin mb-7">
        <span className="text-[#B2B2B2] text-lg text-blog-text-reskin font-medium"> {found + ' ' + 'Collection' + `${found === 1 ? '' : 's'}`} </span>
        <span
          className="cursor-pointer hover:font-semibold underline text-black text-[#000] text-lg font-medium"
          onClick={() => {
            setClearedFilters();
            router.push(`/app/discover/collections/${searchTerm}`);
          }}
        >
          See All Collections
        </span>
      </div>
      <div className={tw(
        'gap-2 minmd:grid minmd:grid-cols-2 minmd:space-x-2 minlg:space-x-0 minlg:gap-4',
        !props.sideNavOpen ? 'minxl:grid-cols-3': 'minlg:grid-cols-1 minxl:grid-cols-2')}>
        {showCollectionsItems()}
      </div>
    </>
  );
};

