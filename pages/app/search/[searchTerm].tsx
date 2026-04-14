import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import DefaultLayout from 'components/layouts/DefaultLayout';
import { NFTCard } from 'components/modules/NFTCard/NFTCard';
import { CollectionsResults } from 'components/modules/Search/CollectionsResults';
import { CuratedCollectionsFilter } from 'components/modules/Search/CuratedCollectionsFilter';
import { SideNav } from 'components/modules/Search/SideNav';
import { useFetchNFTsForCollections } from 'graphql/hooks/useFetchNFTsForCollections';
import { useFetchTypesenseSearch } from 'graphql/hooks/useFetchTypesenseSearch';
import { useSearchModal } from 'hooks/state/useSearchModal';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { ResultsPageProps } from 'types';
import { Doppler, getEnvBool } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';
import { getPerPage } from 'utils/helpers';
import { tw } from 'utils/tw';
import { SearchableFields } from 'utils/typeSenseAdapters';

import { getCollection } from 'lib/contentful/api';
import { useRouter } from 'next/router';
import { SlidersHorizontal, X } from 'phosphor-react';
import NoActivityIcon from 'public/icons/no_activity.svg?svgr';
import React, { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

function usePrevious(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function ResultsPage({ data }: ResultsPageProps) {
  const { setSearchModalOpen, sideNavOpen, setSideNavOpen, setResultsPageAppliedFilters, nftsPageSortyBy, setCuratedCollections, curatedCollections, nftsResultsFilterBy, setClearedFilters, setIsDiscoverCollections, isDiscoverCollections } = useSearchModal();
  const router = useRouter();
  const { searchTerm } = router.query;
  const { fetchNFTsForCollections } = useFetchNFTsForCollections();
  const { fetchTypesenseMultiSearch } = useFetchTypesenseSearch();
  const { width: screenWidth } = useWindowDimensions();
  const results = useRef([]);
  const found = useRef(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState([]);
  const [searchedData, setSearchedData] = useState([]);
  const [collectionsSliderData, setCollectionsSliderData] = useState(null);
  const [nftsForCollections, setNftsForCollections] = useState(null);
  const prevVal = usePrevious(page);
  const prevSearchTerm = usePrevious(searchTerm);
  const addressesList = useRef([]);
  const prevFilters = usePrevious(nftsResultsFilterBy);

  useSWR(collectionsSliderData, async () => {
    isNullOrEmpty(nftsForCollections) && await fetchNFTsForCollections({
      collectionAddresses: addressesList.current,
      count: 5
    }).then((collectionsData => {
      setNftsForCollections([...collectionsData.nftsForCollections]);
    }));
  });

  useEffect(() => {
    fetchTypesenseMultiSearch({ searches: [{
      collection: 'collections',
      query_by: SearchableFields.COLLECTIONS_INDEX_FIELDS,
      q: searchTerm?.toString(),
      per_page: 20,
      page: 1,
      filter_by: '',
      facet_by: SearchableFields.FACET_COLLECTIONS_INDEX_FIELDS + (getEnvBool(Doppler.NEXT_PUBLIC_TYPESENSE_SETUP_ENABLED) ? ',issuance,isOfficial,isCurated' : ''),
      exhaustive_search: true,
    }] })
      .then((resp) => {
        setNftsForCollections(null);
        setCollectionsSliderData(resp.results[0]);
      });
  }, [fetchTypesenseMultiSearch, searchTerm]);

  if (collectionsSliderData) {
    addressesList.current = collectionsSliderData.hits?.map((nft) => {
      return nft.document?.contractAddr;
    });
  }

  useEffect(() => {
    isDiscoverCollections && setIsDiscoverCollections(false);
  }, [isDiscoverCollections, setIsDiscoverCollections]);

  useEffect(() => {
    if (isNullOrEmpty(curatedCollections)) {
      setCuratedCollections(data);
    }
  }, [curatedCollections, data, setCuratedCollections]);

  useEffect(() => {
    if (prevSearchTerm !== searchTerm){
      setFilters([]);
      setPage(1);
      setClearedFilters();
      setResultsPageAppliedFilters('', '','', []);
    }
  },[prevSearchTerm, searchTerm, setClearedFilters, setResultsPageAppliedFilters]);

  useEffect(() => {
    const checkFacetType = () => {
      return ',listings.marketplace,status,listings.price,nftType,contractName';
    };
    if (page > 1 && nftsResultsFilterBy !== prevFilters){
      setPage(1);
      return;
    }else {
      page === 1 && screenWidth && fetchTypesenseMultiSearch({ searches: [{
        facet_by: checkFacetType(),
        max_facet_values: 200,
        collection: 'nfts',
        query_by: SearchableFields.NFTS_INDEX_FIELDS + (getEnvBool(Doppler.NEXT_PUBLIC_TYPESENSE_SETUP_ENABLED) ? ',listings.type,listings.currency,listings.marketplace' : ',marketplace,listingType,currency'),
        q: searchTerm?.toString(),
        per_page: getPerPage('discoverNFTs', screenWidth, sideNavOpen),
        page: page,
        filter_by: nftsResultsFilterBy,
        sort_by: nftsPageSortyBy,
        exhaustive_search: true,
      }] })
        .then((resp) => {
          results.current = [...resp.results[0].hits];
          found.current = resp.results[0].found;
          setSearchedData(resp.results[0].hits);
          filters.length < 1 && !isNullOrEmpty(resp.results[0]?.facet_counts) && setFilters([...resp.results[0].facet_counts]);
        });
    }
  },[fetchTypesenseMultiSearch, filters.length, nftsResultsFilterBy, nftsPageSortyBy, page, screenWidth, searchTerm, sideNavOpen, prevFilters]);

  useEffect(() => {
    const checkFacetType = () => {
      return ',listings.marketplace,status,listings.price,nftType,contractName';
    };
    if (page > 1 && page !== prevVal) {
      screenWidth && fetchTypesenseMultiSearch({ searches: [{
        facet_by: checkFacetType(),
        max_facet_values: 200,
        collection: 'nfts',
        query_by: SearchableFields.NFTS_INDEX_FIELDS + (getEnvBool(Doppler.NEXT_PUBLIC_TYPESENSE_SETUP_ENABLED) ? ',listings.type,listings.currency,listings.marketplace' : ',marketplace,listingType,currency'),
        q: searchTerm?.toString(),
        per_page: getPerPage('discoverNFTs', screenWidth, sideNavOpen),
        page: page,
        filter_by: nftsResultsFilterBy,
        sort_by: nftsPageSortyBy,
        exhaustive_search: true,
      }] })
        .then((resp) => {
          results.current = [...results.current,...resp.results[0].hits];
          found.current = resp.results[0].found;
          filters.length < 1 && !isNullOrEmpty(resp.results[0]?.facet_counts) && setFilters([...resp.results[0].facet_counts]);
          setSearchedData([...searchedData,...resp.results[0].hits]);
          addressesList.current = searchedData?.map((nft) => {
            return nft.document?.contractAddr;
          });
        });
    }
  }, [addressesList, fetchTypesenseMultiSearch, filters.length, nftsPageSortyBy, nftsResultsFilterBy, page, prevVal, results, screenWidth, searchTerm, searchedData, sideNavOpen]);
  return (
    <div className="p-1 mt-7 minmd:p-4 minlg:p-16 mb-10 minxl:overflow-x-hidden min-h-screen overflow-hidden">
      <div className="w-full min-h-disc px-2 minlg:px-0">
        <div className='minmd:my-10 flex items-center'>
          <div
            className={`hidden minlg:block max-w-[112px] overflow-hidden cursor-pointer ${sideNavOpen ? 'mr-[206px]' : 'mr-4'}`}
            onClick={() => setSideNavOpen(!sideNavOpen)}>
            {sideNavOpen ?
              <div className="flex items-center justify-center bg-[#F2F2F2] text-[#6A6A6A] py-3 px-5 text-lg rounded-[48px]">
                Filters
                <X size={22} className="text-[#6A6A6A] ml-2" />
              </div> :
              <div className="flex items-center justify-center bg-black text-white py-3 px-5 text-lg rounded-[48px]">
                <SlidersHorizontal size={22} className="mr-2"/>
                <p>Filter</p>
              </div>
            }
          </div>
          <div className="px-0 flex mt-0 mr-4 justify-between minlg:hidden">
            <div onClick={() => setSearchModalOpen(true, 'filters', filters )} className={'flex items-center justify-center bg-black text-white w-10 h-10 rounded-full text-lg  cursor-pointer'}>
              <SlidersHorizontal size={22}/>
            </div>
          </div>
        </div>
        <div className="flex justify-center minmd:mt-5 minlg:mt-0">
          <div className="hidden minlg:block">
            <SideNav onSideNav={() => null} filtersData={filters}/>
          </div>
          <div className="flex-auto minxl:px-0">
            <div className="block minlg:hidden"><CuratedCollectionsFilter onClick={() => null} /></div>
            <div className="mt-5 minlg:mt-0">
              {!isNullOrEmpty(collectionsSliderData) &&
                <CollectionsResults sideNavOpen={sideNavOpen} searchTerm={searchTerm.toString()} nftsForCollections={nftsForCollections} found={collectionsSliderData?.found} typesenseCollections={collectionsSliderData?.hits}/>}
              <div className="flex justify-between items-center mt-12 font-noi-grotesk text-blog-text-reskin text-xs minmd:text-sm font-black">
                <div className="text-lg text-blog-text-reskin font-medium">
                  {found.current + ' ' + 'NFT' + `${found.current === 1 ? '' : 's'}`}
                </div>
                {<span
                  className="cursor-pointer hover:font-semibold underline text-[#000] text-lg font-medium"
                  onClick={() => {
                    router.push(`/app/discover/nfts/${searchTerm.toString()}`);
                  }}
                >
                  See All NFTs
                </span>}
              </div>
              {
                !searchedData?.length
                  ? (
                    <div className='flex items-center justify-center full-width flex-col my-10'>
                      <NoActivityIcon className='mt-10 h-[300px]' />
                      <div className="md:text-[20px] text-[24px] font-semibold font-noi-grotesk mb-2 flex items-center justify-center mt-5 text-[#4D4D4D]">No Results Found</div>
                    </div>
                  )
                  : null
              }
              <div className={tw(`grid grid-cols-2 mt-4 ${sideNavOpen ? 'gap-2 minhd:grid-cols-5 minxxl:grid-cols-4 minxl:grid-cols-3 minlg:grid-cols-2  minmd:grid-cols-2 grid-cols-1' : 'gap-2 minhd:grid-cols-6 minxxl:grid-cols-5 minxl:grid-cols-4  minlg:grid-cols-3  minmd:grid-cols-2 grid-cols-1'} `)}>
                {searchedData && searchedData.map((item, index) => {
                  return (
                    <div key={index} className='DiscoverCollectionItem'>
                      <NFTCard
                        name={item.document.nftName}
                        images={[item.document.imageURL]}
                        contractAddr={item.document.contractAddr}
                        tokenId={item.document.tokenId}
                        collectionName={item.document.contractName}
                        redirectTo={`/app/nft/${item.document.contractAddr}/${item.document.tokenId}`}
                      />
                    </div>);
                })}
              </div>
              {searchedData && searchedData.length < found.current && <div className="mx-auto w-full minxl:w-1/4 flex justify-center mt-9 font-medium">
                <Button
                  size={ButtonSize.LARGE}
                  scaleOnHover
                  stretch={true}
                  label={'Load More'}
                  onClick={() => setPage(page + 1)}
                  type={ButtonType.PRIMARY}
                />
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ResultsPage.getLayout = function getLayout(page) {
  return (
    <DefaultLayout>
      { page }
    </DefaultLayout>
  );
};

export async function getServerSideProps({ preview = false }) {
  const curData = await getCollection(false, 10, 'curatedCollectionsCollection', 'tabTitle contractAddresses');
  return {
    props: {
      preview,
      data: curData ?? null,
    }
  };
}
