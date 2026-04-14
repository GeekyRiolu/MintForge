import { Maybe, Nft } from 'graphql/generated/types';
import { useUpdateNftMemoMutation } from 'graphql/hooks/useUpdateNftMemoMutation';

import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PartialDeep } from 'type-fest';

export interface NFTDetailContextType {
  userIsOwner: boolean;
  editMemo: boolean;
  draftMemo: Maybe<string>;
  setDraftMemo: (memo: string) => void;
  saveMemo: () => void;
  setEditMemo: (editMemo: boolean) => void;
  clearDraft: () => void;
  saving: boolean;
}

export const NFTDetailContext = React.createContext<NFTDetailContextType>({
  userIsOwner: false,
  editMemo: false,
  draftMemo: '',
  setDraftMemo: () => '',
  saveMemo: () => null,
  setEditMemo: () => null,
  clearDraft: () => null,
  saving: false,
});

export interface NFTDetailContextProviderProps {
  nft: PartialDeep<Nft>;
}

export function NFTDetailContextProvider(
  props: PropsWithChildren<NFTDetailContextProviderProps>
) {
  const [editMemo, setEditMemo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftMemo, setDraftMemo] = useState<string>(props?.nft?.memo);

  useEffect(() => {
    if(draftMemo == null) {
      setDraftMemo(props?.nft?.memo);
    }
  }, [draftMemo, props]);

  const { updateNftmemo } = useUpdateNftMemoMutation();

  const clearDraft = useCallback(() => {
    setDraftMemo(props?.nft?.memo);
  }, [props?.nft?.memo]);

  const saveMemo = useCallback(async () => {
    try {
      setSaving(true);
      const memoUpdateResult = await updateNftmemo({
        memo: draftMemo ?? '',
        nftId: props?.nft?.id
      });
      if (memoUpdateResult) {
        setSaving(false);
        toast.success('Profile changes saved');
      }
    } catch (err) {
      console.log('error while saving memo: ', err);
      toast.error('Error while saving profile.');
      clearDraft();
      setSaving(false);
    }
  }, [clearDraft, draftMemo, props?.nft?.id, updateNftmemo]);

  return <NFTDetailContext.Provider value={{
    userIsOwner: props?.nft?.isOwnedByMe,
    editMemo,
    setEditMemo: (enabled: boolean) => {
      setEditMemo(enabled);
    },
    draftMemo,
    setDraftMemo: (bio: string) => {
      setDraftMemo(bio);
    },
    saveMemo,
    saving,
    clearDraft,
  }}>
    {props.children}
  </NFTDetailContext.Provider>;
}

