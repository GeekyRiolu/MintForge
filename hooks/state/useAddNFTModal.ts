import { useCallback } from 'react';
import useSWR from 'swr';

export function useAddNFTModal() {
  const { data, mutate } = useSWR('addNFTModal', { fallbackData: false });

  const loading = !data;
  const useToggleAddNFTModal = useCallback(() => {
    mutate(!data);
  }, [data, mutate]);

  return {
    loading,
    addNFTModalOpen: data,
    useToggleAddNFTModal,
  };
}