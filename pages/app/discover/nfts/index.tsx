import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { NFTCardSkeleton } from 'components/elements/Skeletons/NFTCardSkeleton';
import DefaultLayout from 'components/layouts/DefaultLayout';
import { NFTCard } from 'components/modules/NFTCard/NFTCard';
import { SideNav } from 'components/modules/Search/SideNav';
import { useFetchTypesenseSearch } from 'graphql/hooks/useFetchTypesenseSearch';
import { useSearchModal } from 'hooks/state/useSearchModal';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { isNullOrEmpty } from 'utils/format';
import { getPerPage } from 'utils/helpers';
import { tw } from 'utils/tw';

import { SlidersHorizontal, X } from 'phosphor-react';
import NoActivityIcon from 'public/icons/no_activity.svg?svgr';
import React, { useEffect, useRef, useState } from 'react';

function usePrevious(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function DiscoverNftsPage() {
  const [page, setPage] = useState(1);
  const { sideNavOpen, setSideNavOpen, setSearchModalOpen, nftsResultsFilterBy, setClearedFilters, setIsDiscoverCollections, isDiscoverCollections } = useSearchModal();
  const { fetchTypesenseSearch } = useFetchTypesenseSearch();
  const [filters, setFilters] = useState([]);
  const [nftSData, setNftsData] = useState([]);
  const [found, setTotalFound] = useState(null);
  const [loading, setLoading] = useState(false);
  const prevFilters = usePrevious(nftsResultsFilterBy);
  const { width: screenWidth } = useWindowDimensions();

  const NFTS_LOAD_COUNT = getPerPage('discoverNFTs', screenWidth, sideNavOpen);

  useEffect(() => {
    isDiscoverCollections && setIsDiscoverCollections(false);
  }, [isDiscoverCollections, setIsDiscoverCollections]);

  useEffect(() => {
    if (page > 1 && nftsResultsFilterBy !== prevFilters) {
      setPage(1);
      return;
    } else {
      setLoading(true);
      fetchTypesenseSearch({
        facet_by: ',listings.marketplace,status,listings.price,nftType',
        index: 'nfts',
        q: '*',
        sort_by: 'score:desc',
        query_by: '',
        filter_by: nftsResultsFilterBy,
        per_page: NFTS_LOAD_COUNT,
        page: page,
      }).then((results) => {
        setLoading(false);
        setTotalFound(results.found);
        page > 1 ? setNftsData([...nftSData, ...results.hits]) : setNftsData(results.hits);
        filters.length < 1 && !isNullOrEmpty(results?.facet_counts) && setFilters([...results.facet_counts]);
      });
    }
    return () => {
      setClearedFilters();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTypesenseSearch, page, nftsResultsFilterBy, filters]);
  const showNftView = () => {
    return (
      <div className={tw(
        'gap-2 minmd:grid minmd:gap-4 space-y-4 minmd:space-y-0 minmd:space-x-0 minlg:gap-4',
        sideNavOpen
          ? 'minhd:grid-cols-5 minxxl:grid-cols-4 minxl:grid-cols-3 minlg:grid-cols-2 minmd:grid-cols-2 grid-cols-1 w-full' :
          'minhd:grid-cols-6 minxxl:grid-cols-5 minxl:grid-cols-4  minlg:grid-cols-3  minmd:grid-cols-2 grid-cols-1 w-full')}
      >
        {nftSData && nftSData?.length > 0 && nftSData?.map((item, index) => {
          return (
            <NFTCard
              key={index}
              name={item.document.nftName}
              tokenId={item.document.tokenId}
              contractAddr={item.document.contractAddr}
              images={[item.document.imageURL]}
              collectionName={item.document.contractName}
              redirectTo={`/app/nft/${item.document.contractAddr}/${item.document.tokenId}`}
            />
          );
        })}
      </div>
    );
  };
  return (
    <>
      <div className="p-2 minmd:p-4 minlg:p-8 minhd:p-16 minmd:m-0 mb-10 minlg:mb-10 minlg:mt-20 minmd:max-w-full self-center minmd:self-stretch minxl:mx-auto min-h-screen ">
        <div className="flex">
          <div className=" w-full min-h-disc">
            <div>
              <div className='flex justify-between mb-10'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center'>
                    <div
                      className={`hidden minlg:block max-w-[112px] overflow-hidden cursor-pointer ${sideNavOpen ? 'mr-[206px]' : 'mr-4'}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setSideNavOpen(!sideNavOpen);
                      }}>
                      {sideNavOpen ?
                        <div className="flex items-center justify-center bg-[#F2F2F2] text-[#6A6A6A] py-3 px-5 text-lg rounded-[48px]">
                          Filters
                          <X size={22} className="text-[#6A6A6A] ml-2" />
                        </div> :
                        <div className="flex items-center justify-center bg-black text-white py-3 px-5 text-lg rounded-[48px]">
                          <SlidersHorizontal size={22} className="mr-2" />
                          <p>Filter</p>
                        </div>
                      }
                    </div>
                    <div className="px-0 flex mt-0 mr-4 justify-between minlg:hidden">
                      <div onClick={() => setSearchModalOpen(true, 'filters', filters)} className={'flex items-center justify-center bg-black text-white w-10 h-10 rounded-full text-lg  cursor-pointer'}>
                        <SlidersHorizontal size={22} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex">
                <div className="flex-auto w-full">
                  <div className='flex items-start justify-center'>
                    <div className={'hidden minlg:block'}>
                      <SideNav onSideNav={() => null} filtersData={filters} />
                    </div>
                    <div className='grid-cols-1 w-full'>
                      {
                        !loading && nftSData?.length === 0
                          ? (
                            <div>
                              <NoActivityIcon className='m-auto mt-10 h-[300px]' />
                              <div className="md:text-[20px] text-[24px] font-semibold font-noi-grotesk mb-2 flex items-center justify-center mt-5 text-[#4D4D4D]">No Results Found</div>
                            </div>
                          )
                          : null
                      }
                      {nftSData?.length > 0 && showNftView()}
                      {loading &&
                    (
                      <div className={tw(
                        'gap-2 minmd:grid minmd:gap-4 minmd:space-x-0 minlg:gap-4 mt-3',
                        sideNavOpen
                          ? 'minhd:grid-cols-5 minxxl:grid-cols-4 minxl:grid-cols-3 minlg:grid-cols-2 minmd:grid-cols-2 grid-cols-1 w-full' :
                          'minhd:grid-cols-6 minxxl:grid-cols-5 minxl:grid-cols-4  minlg:grid-cols-3  minmd:grid-cols-2 grid-cols-1 w-full')}
                      >
                        {[...Array(12).keys()].map((_, index) => (
                          <NFTCardSkeleton key={index} />
                        ))}
                      </div>
                    )}
                    </div>
                  </div>

                  {nftSData && nftSData.length < found && nftSData?.length > 0 &&
                    <div className="mx-auto w-full minxl:w-1/4 flex justify-center mt-7 font-medium">
                      <Button
                        size={ButtonSize.LARGE}
                        scaleOnHover
                        stretch={true}
                        label={'Load More'}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(page + 1);
                        }}
                        type={ButtonType.PRIMARY}
                      />
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

DiscoverNftsPage.getLayout = function getLayout(page) {
  return (
    <DefaultLayout showDNavigation={true}>
      {page}
    </DefaultLayout>
  );
};
