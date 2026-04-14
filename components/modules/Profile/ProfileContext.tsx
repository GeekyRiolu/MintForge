import { Maybe, Nft, ProfileDisplayType, ProfileLayoutType } from 'graphql/generated/types';
import { useFileUploadMutation } from 'graphql/hooks/useFileUploadMutation';
import { useMyNFTsQuery } from 'graphql/hooks/useMyNFTsQuery';
import { usePreviousValue } from 'graphql/hooks/usePreviousValue';
import { useProfileNFTsQuery } from 'graphql/hooks/useProfileNFTsQuery';
import { useProfileOrderingUpdateMutation } from 'graphql/hooks/useProfileOrderingUpdateMutation';
import { useProfileQuery } from 'graphql/hooks/useProfileQuery';
import { useUpdateProfileMutation } from 'graphql/hooks/useUpdateProfileMutation';
import { useUpdateProfileImagesMutation } from 'graphql/hooks/useUploadProfileImagesMutation';
import useDebounce from 'hooks/useDebounce';
import { useMyNftProfileTokens } from 'hooks/useMyNftProfileTokens';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { Doppler,getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';
import { getPerPage, profileSaveCounter } from 'utils/helpers';

import { DetailedNft } from './NftGrid';

import { useAtom } from 'jotai';
import moment from 'moment';
import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { toast } from 'react-toastify';
import { PartialDeep } from 'type-fest';
import { useNetwork } from 'wagmi';

export interface DraftImg {
  preview: Maybe<string>,
  raw: Maybe<string | File>
}

export interface ProfileContextType {
  // display state
  publiclyVisibleNfts: PartialDeep<Nft>[];
  publiclyVisibleNftsNoEdit: PartialDeep<Nft>[];
  editModeNfts: PartialDeep<DetailedNft>[];
  publiclyVisibleNftCount: number;
  allOwnerNfts: PartialDeep<Nft>[];
  allOwnerNftCount: number;
  userIsAdmin: boolean;
  loadMoreNfts: () => void;
  loadMoreNftsEditMode: () => void;
  setAllItemsOrder: (items: PartialDeep<Nft>[]) => void;
  // editor state
  toggleHidden: (id: string, currentVisibility: boolean) => void;
  hideNftIds: (toHide: string[], hideAll?: boolean) => void;
  showNftIds: (toShow: string[], showAll?: boolean) => void;
  draftHeaderImg: DraftImg,
  setDraftHeaderImg: (img: DraftImg) => void,
  draftProfileImg: DraftImg,
  setDraftProfileImg: (img: DraftImg) => void,
  draftBio: Maybe<string>,
  setDraftBio: (bio: string) => void,
  draftGkIconVisible: Maybe<boolean>,
  setDraftGkIconVisible: (val: boolean) => void,
  draftDeployedContractsVisible: Maybe<boolean>,
  setDraftDeployedContractsVisible: (val: boolean) => void,
  draftDisplayType: ProfileDisplayType,
  setDraftDisplayType: (displayType: ProfileDisplayType) => void,
  draftLayoutType: ProfileLayoutType,
  setLayoutType: (layoutType: ProfileLayoutType) => void,
  setDescriptionsVisible: (isVisible: boolean) => void,
  setDraftLayoutType: (layoutType: ProfileLayoutType) => void,
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  clearDrafts: () => void;
  saveProfile: () => void;
  saving: boolean;
  selectedCollection: Maybe<string>;
  setSelectedCollection: (collectionAddress: string) => void;
  draftNftsDescriptionsVisible: Maybe<boolean>;
  setDraftNftsDescriptionsVisible: (val: boolean) => void;
  loading: boolean;
  loadingAllOwnerNfts: boolean;
  hideAllNFTsValue: boolean;
  showAllNFTsValue: boolean;
  currentNftsDescriptionsVisible: boolean;
  currentLayoutType: ProfileLayoutType;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  debouncedSearchQuery: string;
  publicProfileLoadCount: number;
}

// initialize with default values
export const ProfileContext = React.createContext<ProfileContextType>({
  publiclyVisibleNfts: [],
  publiclyVisibleNftsNoEdit: [],
  editModeNfts: [],
  publiclyVisibleNftCount: 0,
  allOwnerNfts: [],
  allOwnerNftCount: 0,
  loadMoreNfts: () => null,
  loadMoreNftsEditMode: () => null,
  setAllItemsOrder: () => null,
  userIsAdmin: false,
  toggleHidden: () => null,
  hideNftIds: () => null,
  showNftIds: () => null,
  draftHeaderImg: { preview: '', raw: '' },
  setDraftHeaderImg: () => null,
  draftProfileImg: { preview: '', raw: '' },
  setDraftProfileImg: () => null,
  draftBio: '',
  setDraftBio: () => '',
  draftGkIconVisible: true,
  setDraftGkIconVisible: () => null,
  draftDeployedContractsVisible: false,
  setDraftDeployedContractsVisible: () => null,
  draftDisplayType: ProfileDisplayType.Nft,
  setDraftDisplayType: () => null,
  draftLayoutType: ProfileLayoutType.Default,
  setDraftLayoutType: () => null,
  setLayoutType: () => null,
  setDescriptionsVisible: () => null,
  editMode: false,
  setEditMode: () => null,
  clearDrafts: () => null,
  saveProfile: () => null,
  saving: false,
  selectedCollection: null,
  setSelectedCollection: () => null,
  draftNftsDescriptionsVisible: true,
  setDraftNftsDescriptionsVisible: () => null,
  loading: false,
  loadingAllOwnerNfts: false,
  hideAllNFTsValue: false,
  showAllNFTsValue: false,
  currentNftsDescriptionsVisible: true,
  currentLayoutType: ProfileLayoutType.Default,
  searchQuery: '',
  setSearchQuery: () => null,
  debouncedSearchQuery: null,
  publicProfileLoadCount: 8,
});

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error(
      'Profiles components cannot be rendered outside the ProfileContextProvider!'
    );
  }
  return context;
};

export interface ProfileContextProviderProps {
  profileURI: string;
}

/**
 * This context provides state management and helper functions for viewing and editing Profiles.
 */
export function ProfileContextProvider(
  props: PropsWithChildren<ProfileContextProviderProps>
) {
  const { chain } = useNetwork();
  const { usePrevious } = usePreviousValue();

  /**
   * Queries
   */
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 1000);
  const { profileData } = useProfileQuery(props.profileURI);
  const { profileTokens: ownedProfileTokens } = useMyNftProfileTokens();
  const [paginatedAllOwnerNfts, setPaginatedAllOwnerNfts] = useState([]);
  const [afterCursor, setAfterCursor] = useState('');
  const [afterCursorEditMode, setAfterCursorEditMode] = useState('');
  const { width: screenWidth } = useWindowDimensions();
  const PUBLIC_PROFILE_LOAD_COUNT = getPerPage('profilePage', screenWidth);

  const {
    nfts: publicProfileNfts,
    totalItems: publicProfileNftsCount,
    mutate: mutatePublicProfileNfts,
    loading,
    pageInfo
  } = useProfileNFTsQuery({
    profileId: profileData?.profile?.id,
    chainId: String(chain?.id || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)),
    first: PUBLIC_PROFILE_LOAD_COUNT,
    beforeCursor: afterCursor,
    query: debouncedSearch
  });

  const {
    data: allOwnerNfts,
    loading: loadingAllOwnerNfts,
    totalItems: allOwnerNftCount,
    mutate: mutateAllOwnerNfts,
    pageInfo: allOwnerNftsPageInfo,
  } = useMyNFTsQuery({ first: PUBLIC_PROFILE_LOAD_COUNT, profileId: profileData?.profile?.id, beforeCursor: afterCursorEditMode, query: debouncedSearch });
  /**
   * Profile v2 instant update state
   */
  const [currentLayoutType, setCurrentLayoutType] = useState<ProfileLayoutType>(ProfileLayoutType.Default);
  const [currentNftsDescriptionsVisible, setCurrentNftsDescriptionsVisible] = useState<boolean>(profileData?.profile?.nftsDescriptionsVisible);

  /**
   * Edit mode state
   */
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftBio, setDraftBio] = useState<string>(profileData?.profile?.description);
  const [draftGkIconVisible, setDraftGkIconVisible] = useState<boolean>(profileData?.profile?.gkIconVisible);
  const [draftNftsDescriptionsVisible, setDraftNftsDescriptionsVisible] = useState<boolean>(profileData?.profile?.nftsDescriptionsVisible);
  const [draftProfileImg, setDraftProfileImg] = useState({ preview: '', raw: null });
  const [draftHeaderImg, setDraftHeaderImg] = useState({ preview: '', raw: null });
  const [draftDisplayType, setDraftDisplayType] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState<string>(null);
  const [draftLayoutType, setDraftLayoutType] = useState<ProfileLayoutType>(ProfileLayoutType.Default);
  const [draftDeployedContractsVisible, setDraftDeployedContractsVisible] = useState<boolean>(profileData?.profile?.deployedContractsVisible);

  useEffect(() => {
    // make sure these initial values are set when the Profile data loads.
    if (draftBio == null) {
      setDraftBio(profileData?.profile?.description);
    }
    if (draftGkIconVisible == null) {
      setDraftGkIconVisible(profileData?.profile?.gkIconVisible);
    }
    if (draftNftsDescriptionsVisible == null) {
      setDraftNftsDescriptionsVisible(profileData?.profile?.nftsDescriptionsVisible);
    }
    if (draftDeployedContractsVisible == null) {
      setDraftDeployedContractsVisible(profileData?.profile?.deployedContractsVisible);
    }
    if(currentLayoutType == null){
      setCurrentLayoutType(ProfileLayoutType.Default);
    }
    if(currentNftsDescriptionsVisible == null){
      setCurrentNftsDescriptionsVisible(profileData?.profile?.nftsDescriptionsVisible);
    }
  }, [
    draftBio,
    draftDeployedContractsVisible,
    draftGkIconVisible,
    draftNftsDescriptionsVisible,
    currentLayoutType,
    currentNftsDescriptionsVisible,
    profileData?.profile?.deployedContractsVisible,
    profileData?.profile?.description,
    profileData?.profile?.gkIconVisible,
    profileData?.profile?.nftsDescriptionsVisible
  ]);

  // make sure this doesn't overwrite local changes, use server-provided value for initial state only.
  const [publiclyVisibleNfts, setPubliclyVisibleNfts] = useState<PartialDeep<Nft>[]>(null);
  const [publiclyVisibleNftsNoEdit, setPubliclyVisibleNftsNoEdit] = useState<PartialDeep<Nft>[]>(null);
  const [editModeNfts, setEditModeNfts] = useState<PartialDeep<DetailedNft>[]>(null);
  const [currentScrolledPosition, setCurrentScrolledPosition] = useState(0);
  const [isTogglingAll, setIsTogglingAll] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const prevAllOwnerNfts = usePrevious(allOwnerNfts);
  const prevPubliclyVisibleNfts = usePrevious(publiclyVisibleNfts);

  const [showAllNFTsValue, setShowAllNFTsValue] = useState(publicProfileNftsCount === allOwnerNftCount);
  const [hideAllNFTsValue, setHideAllNFTsValue] = useState(publicProfileNftsCount === 0);

  const [savedCount, setSavedCount] = useAtom(profileSaveCounter);
  const [lastAddedPage, setLastAddedPage] = useState('');

  // Profile page NO Edit Mode ONLY
  useEffect(() => {
    if(!loading && !editMode) {
      setPubliclyVisibleNfts(null);
      setEditModeNfts(null);

      if (
        publicProfileNfts?.length > 0 &&
        lastAddedPage !== pageInfo?.firstCursor
      ) {
        setPubliclyVisibleNftsNoEdit([...publiclyVisibleNftsNoEdit || [], ...publicProfileNfts]);
        setLastAddedPage(pageInfo?.firstCursor);
      }
    }
  }, [editMode, lastAddedPage, loading, pageInfo?.firstCursor, publicProfileNfts, publiclyVisibleNftsNoEdit]);

  // Rendering of Edit mode NFTS only - for pagination, toggling and drop/dragging visibility
  useEffect(() => {
    if (!loadingAllOwnerNfts && editMode) {
      setPubliclyVisibleNftsNoEdit(null);
      const allOwnerNftsWithHiddenValue = allOwnerNfts.map(nft => {
        return { ...nft, hidden: nft.isHide };
      });

      // Edit mode NFTS rendering for the first time
      if (isNullOrEmpty(editModeNfts) && afterCursorEditMode === '' && allOwnerNfts.length > 0) {
        setPubliclyVisibleNfts([...allOwnerNftsWithHiddenValue.filter(nft => !nft.isHide)]);
        const paginatedNotPubliclyVisibleNftsLast = paginatedAllOwnerNfts?.filter(nft => publiclyVisibleNfts?.find(nft2 => nft2.id === nft.id) == null) ?? [];
        setPaginatedAllOwnerNfts([...allOwnerNftsWithHiddenValue]);
        setEditModeNfts([
          ...(publiclyVisibleNfts || []),
          ...paginatedNotPubliclyVisibleNftsLast || []
        ]);
      }

      const showAllNfts = showAllNFTsValue && !hideAllNFTsValue && allOwnerNftsWithHiddenValue && allOwnerNftsWithHiddenValue.length > 0;
      if(showAllNfts) {
        allOwnerNftsWithHiddenValue.forEach(nft => nft.hidden = false);
      }

      const hideAllNfts = !showAllNFTsValue && hideAllNFTsValue && allOwnerNftsWithHiddenValue && allOwnerNftsWithHiddenValue.length > 0;
      if(hideAllNfts) {
        allOwnerNftsWithHiddenValue.forEach(nft => nft.hidden = true);
      }

      // Edit mode NFTS rendering as user scroll down - pagination
      if (!isToggling && allOwnerNfts && prevAllOwnerNfts !== allOwnerNfts && afterCursorEditMode !== '' && allOwnerNfts.length !== 0) {
        const publicVisiblePaginatedNFTs = allOwnerNftsWithHiddenValue.filter(nft => !nft.isHide);
        const loadMorePaginatedNFTs = [...paginatedAllOwnerNfts || [], ...allOwnerNftsWithHiddenValue];

        setPaginatedAllOwnerNfts([...loadMorePaginatedNFTs]);
        setPubliclyVisibleNfts([...publiclyVisibleNfts || [],...publicVisiblePaginatedNFTs]);

        const paginatedNotPubliclyVisibleNftsLast = loadMorePaginatedNFTs?.filter(nft => publiclyVisibleNfts?.find(nft2 => nft2.id === nft.id) == null) ?? [];

        setEditModeNfts([
          ...(publiclyVisibleNfts || []),
          ...paginatedNotPubliclyVisibleNftsLast || []
        ]);
      }

      if (isDragging && prevPubliclyVisibleNfts !== publiclyVisibleNfts) {
        const paginatedNotPubliclyVisibleNftsLast = paginatedAllOwnerNfts?.filter(nft => publiclyVisibleNfts?.find(nft2 => nft2.id === nft.id) == null) ?? [];

        setEditModeNfts([
          ...(publiclyVisibleNfts || []),
          ...paginatedNotPubliclyVisibleNftsLast || []
        ]);
        setIsDragging(false);
      }

      if (isToggling && prevPubliclyVisibleNfts !== publiclyVisibleNfts) {
        const paginatedNotPubliclyVisibleNftsLast = paginatedAllOwnerNfts?.filter(nft => publiclyVisibleNfts?.find(nft2 => nft2.id === nft.id) == null) ?? [];

        setEditModeNfts([
          ...(publiclyVisibleNfts || []),
          ...paginatedNotPubliclyVisibleNftsLast || []
        ]);
        setIsToggling(false);
      }
    }
  }, [afterCursorEditMode, allOwnerNfts, editMode, editModeNfts, hideAllNFTsValue, isDragging, isToggling, loadingAllOwnerNfts, paginatedAllOwnerNfts, prevAllOwnerNfts, prevPubliclyVisibleNfts, publiclyVisibleNfts, showAllNFTsValue]);

  useEffect(() => {
    if (!loadingAllOwnerNfts && editMode && isTogglingAll) {
      if (showAllNFTsValue && !hideAllNFTsValue ) {
        editModeNfts?.forEach(nft => nft.hidden = false);
        setEditModeNfts([
          ...editModeNfts
        ]);
        setIsTogglingAll(false);
      }
      if (!showAllNFTsValue && hideAllNFTsValue ) {
        editModeNfts?.forEach(nft => nft.hidden= true);
        setEditModeNfts([
          ...editModeNfts
        ]);
        setIsTogglingAll(false);
      }

      currentScrolledPosition !== 0 && window.scrollTo(0, currentScrolledPosition);
    }
  }, [currentScrolledPosition, editMode, editModeNfts, hideAllNFTsValue, isTogglingAll, loadingAllOwnerNfts, showAllNFTsValue]);

  useEffect(() => {
    setDraftDisplayType(null);
  }, [editMode]);

  useEffect(() => {
    if(debouncedSearch !== null || debouncedSearch !== ''){
      setAfterCursor('');
      setPubliclyVisibleNftsNoEdit([]);
    }
  }, [debouncedSearch]);

  const setAllItemsOrder = useCallback((orderedItems: DetailedNft[]) => {
    setIsDragging(true);
    setPubliclyVisibleNfts([...orderedItems.filter((nft: DetailedNft) => !nft.hidden),]);
  }, []);

  /**
   * Mutations
   */
  const { updateProfile } = useUpdateProfileMutation();
  const { fileUpload } = useFileUploadMutation();
  const { uploadProfileImages } = useUpdateProfileImagesMutation();
  const { updateOrder } = useProfileOrderingUpdateMutation();

  const toggleHidden = useCallback(async(
    id: string,
    currentVisibility: boolean
  ) => {
    setShowAllNFTsValue(false);
    setHideAllNFTsValue(false);
    const nft = paginatedAllOwnerNfts.find(nft => nft.id === id);
    await setCurrentScrolledPosition(window.pageYOffset);
    if (currentVisibility) {
      setIsToggling(true);
      nft.hidden = true;
      setPubliclyVisibleNfts((publiclyVisibleNfts ?? []).slice().filter(nft => nft.id !== id));
    } else {
      setIsToggling(true);
      // NFT is currently hidden.
      nft.hidden = false;
      setPubliclyVisibleNfts([...publiclyVisibleNfts, nft]);
    }
  }, [paginatedAllOwnerNfts, publiclyVisibleNfts]);

  const clearDrafts = useCallback(() => {
    // reset
    setDraftProfileImg({ preview: '', raw: null });
    setDraftHeaderImg({ preview: '', raw: null });
    setDraftBio(profileData?.profile?.description);
    setDraftGkIconVisible(draftGkIconVisible);
    setDraftNftsDescriptionsVisible(draftNftsDescriptionsVisible);
    setDraftDeployedContractsVisible(profileData?.profile?.deployedContractsVisible);
    setEditMode(false);
    setDraftLayoutType(ProfileLayoutType.Default);
    setPubliclyVisibleNfts(null);
    setEditModeNfts(null);
  }, [
    draftGkIconVisible,
    draftNftsDescriptionsVisible,
    profileData?.profile?.deployedContractsVisible,
    profileData?.profile?.description
  ]);

  useEffect(() => {
    setSelectedCollection(null);
  }, [editMode]);

  const saveProfile = useCallback(async () => {
    try {
      if (draftProfileImg?.raw?.size > 2000000) { // 2MB
        alert('Profile image is too large (> 2MB). Please upload a smaller image.');
        setDraftProfileImg({ preview: '', raw: null });
      } else if (draftHeaderImg?.raw?.size > 2000000) { // 2MB
        alert('Header image is too large (> 2MB). Please upload a smaller image.');
        setDraftHeaderImg({ preview: '', raw: null });
      } else {
        setSaving(true);
        const imageUploadResult = await uploadProfileImages({
          profileId: profileData?.profile?.id,
          compositeProfileURL: false,
          avatar: draftProfileImg.raw ?? null,
          banner: draftHeaderImg.raw ?? null
        });

        let headerUploadImage: string;
        let profileUploadImage: string;
        if (!imageUploadResult) {
          if (!isNullOrEmpty(draftHeaderImg.raw)) {
            headerUploadImage = await fileUpload(
              draftHeaderImg,
              props.profileURI + '-header-img-' + moment.now()
            );
          }
          if (!isNullOrEmpty(draftProfileImg.raw)) {
            profileUploadImage = await fileUpload(
              draftProfileImg,
              props.profileURI + '-profile-img-' + moment.now()
            );
          }
        }
        const result = await updateProfile({
          id: profileData?.profile?.id,
          description: isNullOrEmpty(draftBio) ? profileData?.profile?.description : draftBio,
          gkIconVisible: draftGkIconVisible,
          nftsDescriptionsVisible: draftNftsDescriptionsVisible,
          deployedContractsVisible: draftDeployedContractsVisible,
          hideNFTIds: editModeNfts?.filter(nft => publiclyVisibleNfts.find(nft2 => nft2.id === nft.id) == null)?.map(nft => nft.id),
          showNFTIds: publiclyVisibleNfts?.map(nft => nft.id),
          layoutType: draftLayoutType,
          showAllNFTs: showAllNFTsValue,
          hideAllNFTs: hideAllNFTsValue,
          ...(imageUploadResult
            ? {}
            : {
              bannerURL: headerUploadImage,
              photoURL: profileUploadImage,
            })
        });

        if (result) {
          await updateOrder({
            profileId: profileData?.profile?.id,
            updates: editModeNfts?.map((nft, index) => ({ nftId: nft.id, newIndex: index }))
          });
          setSavedCount(savedCount + 1); // update global state
          window.scrollTo(0, 0);
          setAfterCursorEditMode('');
          setPubliclyVisibleNfts(null);
          setEditModeNfts(null);
          setPaginatedAllOwnerNfts(null);
          mutatePublicProfileNfts();
          mutateAllOwnerNfts();

          toast.success('Profile changes saved');
        }
        setSaving(false);
      }
    } catch (err) {
      console.log('error while saving profile: ', err);
      toast.error('Error while saving profile.');
      setSaving(false);
    }
  }, [draftBio, draftDeployedContractsVisible, draftGkIconVisible, draftHeaderImg, draftLayoutType, draftNftsDescriptionsVisible, draftProfileImg, editModeNfts, fileUpload, hideAllNFTsValue, mutateAllOwnerNfts, mutatePublicProfileNfts, profileData?.profile?.description, profileData?.profile?.id, props.profileURI, publiclyVisibleNfts, savedCount, setSavedCount, showAllNFTsValue, updateOrder, updateProfile, uploadProfileImages]);

  const setLayoutType = useCallback(async (type: ProfileLayoutType) => {
    try {
      setCurrentLayoutType(type);
      await updateProfile({
        id: profileData?.profile?.id,
        layoutType: type
      });
    } catch (err) {
      console.log('error while saving profile: ', err);
      toast.error('Error while saving profile.');
    }
  }, [updateProfile, profileData]);

  const setDescriptionsVisible = useCallback(async (isVisible: boolean) => {
    try {
      setCurrentNftsDescriptionsVisible(isVisible);
      await updateProfile({
        id: profileData?.profile?.id,
        nftsDescriptionsVisible: isVisible
      });
    } catch (err) {
      console.log('error while saving profile: ', err);
      toast.error('Error while saving profile.');
    }
  }, [updateProfile, profileData]);

  const loadMoreNfts = useCallback(
    () => {
      if (!editMode) {
        pageInfo.lastCursor && setAfterCursor(pageInfo.lastCursor);
      }
    },
    [editMode, pageInfo, setAfterCursor],
  );

  const hideNftIds = useCallback(
    (toHide: string[], hideAll = false) => {
      setShowAllNFTsValue(false);
      setIsTogglingAll(true);
      if (hideAll && paginatedAllOwnerNfts && paginatedAllOwnerNfts.length > 0) {
        setHideAllNFTsValue(true);
        setPubliclyVisibleNfts([]);
        paginatedAllOwnerNfts.forEach(nft => nft.hidden= true);
        setEditModeNfts([
          ...paginatedAllOwnerNfts
        ]);
      } else {
        setPubliclyVisibleNfts((publiclyVisibleNfts ?? []).slice().filter(nft => !toHide.includes(nft.id)));
      }
    },
    [setShowAllNFTsValue, setIsTogglingAll, paginatedAllOwnerNfts, publiclyVisibleNfts, setEditModeNfts, setPubliclyVisibleNfts],
  );

  const showNftIds = useCallback(
    (toShow: string[], showAll = false) => {
      setHideAllNFTsValue(false);
      setIsTogglingAll(true);
      if (showAll && paginatedAllOwnerNfts && paginatedAllOwnerNfts.length > 0) {
        setShowAllNFTsValue(true);
        paginatedAllOwnerNfts.forEach(nft => nft.hidden= false);
        setEditModeNfts([
          ...paginatedAllOwnerNfts
        ]);
        setPubliclyVisibleNfts([...paginatedAllOwnerNfts]);
      } else {
        const additions = [];
        if (paginatedAllOwnerNfts && paginatedAllOwnerNfts.length > 0) {
          paginatedAllOwnerNfts?.filter(nft => toShow?.includes(nft.id))?.forEach((nft) => {
            if (!publiclyVisibleNfts?.includes(nft) && !additions?.includes(nft)) {
              additions.push(nft);
            }
          });
        }
        const newPubliclyVisibleNfts = paginatedAllOwnerNfts && paginatedAllOwnerNfts.length === additions.length ? [] : (publiclyVisibleNfts ?? []);
        setPubliclyVisibleNfts([...newPubliclyVisibleNfts, ...additions]);
      }
    },
    [paginatedAllOwnerNfts, publiclyVisibleNfts, setHideAllNFTsValue, setIsTogglingAll, setEditModeNfts, setPubliclyVisibleNfts],
  );

  const setMemoEditMode = useCallback(
    (enabled: boolean) => {
      mutatePublicProfileNfts();
      mutateAllOwnerNfts();
      if (enabled) {
        setAfterCursorEditMode('');
        setEditModeNfts(null);
        setPubliclyVisibleNfts(null);
        setPaginatedAllOwnerNfts(null);
        setPubliclyVisibleNftsNoEdit(null);
        setTimeout(() => {
          setEditMode(enabled);
        }, 1000);
      } else {
        setAfterCursor('');
        setEditModeNfts(null);
        setPubliclyVisibleNftsNoEdit(null);
        setPubliclyVisibleNfts(null);
        setTimeout(() => {
          setEditMode(enabled);
        }, 1000);
      }
    },
    [mutateAllOwnerNfts, mutatePublicProfileNfts, setAfterCursorEditMode, setEditModeNfts, setPaginatedAllOwnerNfts, setPubliclyVisibleNftsNoEdit, setAfterCursor],
  );

  const loadMoreNftsEditMode = useCallback(
    () => {
      if (editMode) {
        allOwnerNftsPageInfo.lastCursor && setAfterCursorEditMode(allOwnerNftsPageInfo.lastCursor);
      }
    },
    [editMode, allOwnerNftsPageInfo, setAfterCursorEditMode],
  );

  const value = useMemo(() => ({
    editModeNfts: editModeNfts ?? [],
    allOwnerNfts: paginatedAllOwnerNfts ?? [],
    allOwnerNftCount: allOwnerNftCount ?? 0,
    publiclyVisibleNfts: publiclyVisibleNfts ?? [],
    publiclyVisibleNftCount: publicProfileNftsCount ?? 0,
    publiclyVisibleNftsNoEdit: publiclyVisibleNftsNoEdit ?? [],
    loadMoreNfts,
    loadMoreNftsEditMode,
    setAllItemsOrder,
    userIsAdmin: ownedProfileTokens
      .map(token => token?.tokenUri?.raw?.split('/').pop())
      .includes(props.profileURI),
    editMode,
    setEditMode: setMemoEditMode,
    draftHeaderImg,
    draftProfileImg,
    setDraftHeaderImg,
    setDraftProfileImg,
    draftBio,
    setDraftBio,
    draftGkIconVisible,
    setDraftGkIconVisible,
    draftDeployedContractsVisible,
    setDraftDeployedContractsVisible,
    draftNftsDescriptionsVisible,
    setDraftNftsDescriptionsVisible,
    draftDisplayType,
    setDraftDisplayType,
    setLayoutType,
    setDescriptionsVisible,
    draftLayoutType,
    setDraftLayoutType,
    toggleHidden,
    hideNftIds,
    showNftIds,
    saveProfile,
    saving,
    clearDrafts,
    selectedCollection,
    setSelectedCollection,
    loading,
    loadingAllOwnerNfts,
    hideAllNFTsValue,
    showAllNFTsValue,
    currentNftsDescriptionsVisible,
    currentLayoutType,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery: debouncedSearch,
    publicProfileLoadCount: PUBLIC_PROFILE_LOAD_COUNT,
  }), [
    allOwnerNftCount,
    draftBio,
    draftDeployedContractsVisible,
    draftGkIconVisible,
    draftHeaderImg,
    draftNftsDescriptionsVisible,
    draftProfileImg,
    editMode,
    editModeNfts,
    loadMoreNfts,
    loadMoreNftsEditMode,
    ownedProfileTokens,
    paginatedAllOwnerNfts,
    props.profileURI,
    publicProfileNftsCount,
    publiclyVisibleNfts,
    publiclyVisibleNftsNoEdit,
    setAllItemsOrder,
    setMemoEditMode,
    debouncedSearch,
    draftDisplayType,
    setDraftDisplayType,
    setLayoutType,
    setDescriptionsVisible,
    draftLayoutType,
    setDraftLayoutType,
    toggleHidden,
    hideNftIds,
    showNftIds,
    saveProfile,
    saving,
    clearDrafts,
    selectedCollection,
    setSelectedCollection,
    loading,
    loadingAllOwnerNfts,
    hideAllNFTsValue,
    showAllNFTsValue,
    currentNftsDescriptionsVisible,
    currentLayoutType,
    searchQuery,
    setSearchQuery,
    PUBLIC_PROFILE_LOAD_COUNT
  ]);

  return <ProfileContext.Provider value={value}>
    {props.children}
  </ProfileContext.Provider>;
}
