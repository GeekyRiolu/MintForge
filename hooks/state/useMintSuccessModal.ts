import { useCallback } from 'react';
import useSWR from 'swr';

export function useMintSuccessModal() {
  const { data, mutate } = useSWR('mintSuccessModal', { fallbackData: false });

  const loading = !data;
  const useToggleMintSuccessModal = useCallback(() => {
    mutate(!data);
  }, [data, mutate]);

  const setMintSuccessModalOpen = useCallback((open: boolean) => {
    mutate(open);
  }, [mutate]);

  return {
    loading,
    mintSuccessModal: data,
    useToggleMintSuccessModal,
    setMintSuccessModalOpen,
  };
}