import { useCallback } from 'react';
import useSWR from 'swr';

export function useChangeWallet() {
  const { data, mutate } = useSWR('changeWallet', { fallbackData: false });

  const loading = !data;
  const useToggleChangeWallet = useCallback(() => {
    mutate(!data);
  }, [data, mutate]);

  const setChangeWallet = useCallback((open: boolean) => {
    mutate(open);
  }, [mutate]);

  return {
    loading,
    changeWallet: data,
    useToggleChangeWallet,
    setChangeWallet,
  };
}