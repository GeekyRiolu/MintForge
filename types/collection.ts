import { CollectionInfo, LikeableType, ProfileQuery } from 'graphql/generated/types';
import { ContractSalesStatisticsData, NFTDetailsData } from 'graphql/hooks';

import { Dispatch, ReactNode, SetStateAction } from 'react';
import { PartialObjectDeep } from 'type-fest/source/partial-deep';

export type DefaultPage = {
  contract: string;
  children: ReactNode;
}

export type OfficialPage = DefaultPage & {
  slug: string;
}

export type CollectionProps = DefaultPage | OfficialPage;

export type CollectionContextType = {
  collectionContract: string;
  collectionData: PartialObjectDeep<CollectionInfo, object>;
  mutateCollectionData: () => void;
  collectionName: any;
  collectionNfts: any[];
  collectionNFTInfo: NFTDetailsData;
  collectionPreferredOwnerData: ProfileQuery;
  collectionSalesHistory: ContractSalesStatisticsData;
  contractAddr: string | string[];
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  slug: string | string[];
  found: number;
  selectedTab: number;
  setSelectedTab: Dispatch<SetStateAction<number>>;
  tabs: string[];
  setFound: Dispatch<SetStateAction<number>>;
  setLike: () => Promise<{
    __typename?: 'Like';
    id?: string;
    createdAt?: any;
    updatedAt?: any;
    likedById?: string;
    likedId?: string;
    likedType?: LikeableType;
  }>;
  unsetLike: () => Promise<boolean>;
  setSearchModalOpen: (searchModalOpen: boolean, modalType?: string, searchFilters?: any) => void;
  sideNavOpen: any;
  setSideNavOpen: (sideNavOpen: boolean) => void;
  setModalType: (modalType: 'search' | 'filters' | 'collectionFilters') => void;
}

export type CollectionHeaderProps = {
  children: ReactNode;
}
