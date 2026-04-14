import { useCallback } from 'react';
import useSWR from 'swr';

export function useWalletSlide() {
  const { data, mutate } = useSWR('walletSlide', { fallbackData: false });

  const loading = !data;

  const useWalletSlideToggle = useCallback(() => {
    mutate(!data);
  }, [data, mutate]);

  const setWalletSlideOpen = useCallback((open: boolean) => {
    mutate(open);
  }, [mutate]);

  return {
    loading,
    walletSlideOpen: data,
    toggleWalletSlide: useWalletSlideToggle,
    setWalletSlideOpen,
  };
}