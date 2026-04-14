import { CuratedCollection } from 'types';

import { useRouter } from 'next/router';
import { useCallback } from 'react';
import useSWR from 'swr';

export function useSearchModal() {
  const router = useRouter();
  const { data, mutate } = useSWR('searchmodal', {
    fallbackData:
    {
      modalType: '',
      searchModalOpen: false,
      isLeaderBoard: true,
      activePeriod: '7d',
      sideNavOpen: !router.pathname.includes('discover/') && !router.pathname.includes('collection/'),
      searchFilters: [],
      filtersList: null,
      checkedFiltersList: '',
      sortBy: '',
      clearedFilters: true,
      curatedCollections: null,
      selectedCuratedCollection: null,
      collectionPageSortyBy: '',
      id_nftName: '',
      nftsResultsFilterBy: '',
      collectionsResultsFilterBy: '',
      nftsPageSortyBy: '',
      checkedArray: [],
      collectionsFilter: {
        issuance: null,
        floor: null,
        currency: null,
        nftTypes: null,
        volume: null
      },
      nftSFilters: {
        listedFloor: null,
        nftTypes: null,
        marketplace: null,
        currency: null,
        price: null,
        status: null,
        contractName: null
      },
      dropDownSearchResults: null,
      keyword: '',
      isDiscoverCollections: false,
    } });

  const loading = !data;

  const useToggleSearchModal = () => {
    mutate({
      ...data,
      searchModalOpen: !data.searchModalOpen
    });
  };

  const useChangeTimePeriod = (period: string) => {
    mutate({
      ...data,
      activePeriod: period
    });
  };
  const useToggleLeaderBoardState = (isLeaderBoard) => {
    mutate({
      ...data,
      isLeaderBoard: isLeaderBoard
    });
  };

  const setSearchModalOpen = useCallback((searchModalOpen: boolean, modalType = 'search', searchFilters?: any) => {
    const filtersList = modalType !== 'collectionFilters' ?
      data.filtersList ?? (searchModalOpen && searchFilters?.map((item) => {
        return {
          filter: item.field_name,
          values: []
        };
      }))
      : [];
    mutate({
      ...data,
      searchModalOpen,
      modalType,
      searchFilters,
      filtersList,
    });
  }, [data, mutate]);

  const setSearchFilters = useCallback((searchFilters: any) => {
    const filtersList = data.filtersList ?? (searchFilters?.map((item) => {
      return {
        filter: item.field_name,
        values: []
      };
    }));
    mutate({
      ...data,
      filtersList,
      searchFilters
    });
  },[data, mutate]);

  const setModalType = useCallback((modalType: 'search' | 'filters' | 'collectionFilters') => {
    mutate({
      ...data,
      modalType,
    });
  },[data, mutate]);

  const setSideNavOpen = useCallback((sideNavOpen: boolean) => {
    mutate({
      ...data,
      sideNavOpen,
    });
  }, [data, mutate]);

  const setSortBy = useCallback((sortBy: string) => {
    mutate({
      ...data,
      sortBy
    });
  },[data, mutate]);

  const setCuratedCollections = useCallback((curatedCollections: CuratedCollection[]) => {
    mutate({
      ...data,
      curatedCollections
    });
  },[data, mutate]);

  const setSelectedCuratedCollection = useCallback((selectedCuratedCollection: CuratedCollection) => {
    mutate({
      ...data,
      selectedCuratedCollection
    });
  },[data, mutate]);

  const setIsDiscoverCollections = useCallback((isDiscoverCollections: boolean) => {
    mutate({
      ...data,
      isDiscoverCollections
    });
  },[data, mutate]);

  const setDropDownSearchResults = useCallback((dropDownSearchResults: any, keyword?: string) => {
    mutate({
      ...data,
      dropDownSearchResults,
      keyword
    });
  },[data, mutate]);

  const setCollectionPageAppliedFilters = useCallback((collectionPageSortyBy: string, id_nftName: string, searchModalOpen = true) => {
    mutate({
      ...data,
      searchModalOpen,
      id_nftName,
      collectionPageSortyBy
    });
  },[data, mutate]);

  const setResultsPageAppliedFilters = useCallback((nftsPageSortyBy: string, nftsResultsFilterBy: string, collectionsResultsFilterBy: string, checkedArray: any) => {
    mutate({
      ...data,
      nftsPageSortyBy,
      nftsResultsFilterBy,
      collectionsResultsFilterBy,
      checkedArray
    });
  },[data, mutate]);

  const setClearedFilters = useCallback(() => {
    mutate({
      ...data,
      clearedFilters: true,
      nftsPageSortyBy: '',
      nftsResultsFilterBy: '',
      collectionsResultsFilterBy: '',
      checkedArray: [],
      collectionsFilter: {
        issuance: null,
        floor: null,
        currency: null,
        nftTypes: null,
        volume: null
      },
      nftSFilters: {
        listedFloor: null,
        nftTypes: null,
        marketplace: null,
        currency: null,
        price: null,
        status: null,
        contractName: null
      },
    });
  },[data, mutate]);

  return {
    loading,
    modalType: data.modalType,
    searchModalOpen: data.searchModalOpen,
    activePeriod: data.activePeriod,
    sideNavOpen: data.sideNavOpen,
    searchFilters: data.searchFilters,
    filtersList: data.filtersList,
    checkedFiltersList: data.checkedFiltersList,
    sortBy:data.sortBy,
    clearedFilters: data.clearedFilters,
    curatedCollections: data.curatedCollections,
    selectedCuratedCollection: data.selectedCuratedCollection,
    collectionPageSortyBy: data.collectionPageSortyBy,
    id_nftName: data.id_nftName,
    nftsPageSortyBy: data.nftsPageSortyBy,
    nftsResultsFilterBy: data.nftsResultsFilterBy,
    collectionsResultsFilterBy: data.collectionsResultsFilterBy,
    checkedArray: data.checkedArray,
    dropDownSearchResults: data.dropDownSearchResults,
    keyword: data.keyword,
    collectionsFilter: data.collectionsFilter,
    nftSFilters: data.nftSFilters,
    isLeaderBoard: data.isLeaderBoard,
    isDiscoverCollections: data.isDiscoverCollections,
    toggleSearchModal: useToggleSearchModal,
    setSearchModalOpen,
    changeTimePeriod: useChangeTimePeriod,
    toggleLeaderBoardState: useToggleLeaderBoardState,
    setModalType,
    setSideNavOpen,
    setSortBy,
    setSearchFilters,
    setCuratedCollections,
    setSelectedCuratedCollection,
    setCollectionPageAppliedFilters,
    setResultsPageAppliedFilters,
    setClearedFilters,
    setDropDownSearchResults,
    setIsDiscoverCollections,
  };
}

