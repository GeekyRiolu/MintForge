import { useCallback } from 'react';
import useSWR from 'swr';

export function useProfileSelectModal() {
  const { data, mutate } = useSWR('profileSelectModal', { fallbackData: false });
  const loading = !data;
  const useToggleProfileSelectModal = useCallback(() => {
    mutate(!data);
  }, [data, mutate]);

  const setProfileSelectModalOpen = useCallback((open: boolean) => {
    mutate(open);
  }, [mutate]);

  return {
    loading,
    profileSelectModal: data,
    useToggleProfileSelectModal,
    setProfileSelectModalOpen,
  };
}