import { useCallback } from 'react';
import useSWR from 'swr';

export function useBidModal() {
  const { data, mutate } = useSWR('bidModal', { fallbackData: false });

  const loading = !data;
  const useToggleBidModal = useCallback(() => {
    mutate(!data);
  }, [data, mutate]);

  const setBidModalOpen = useCallback((open: boolean) => {
    mutate(open);
  }, [mutate]);

  return {
    loading,
    bidModalOpen: data,
    useToggleBidModal,
    setBidModalOpen,
  };
}