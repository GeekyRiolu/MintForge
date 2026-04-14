import { useCallback } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';

export function useSignOutDialog() {
  const { data, mutate } = useSWR('signOutDialog', { fallbackData: false });
  const { address: currentAddress } = useAccount();
  const loading = !data;

  const setSignOutDialogOpen = useCallback((open: boolean) => {
    mutate(open);
  }, [mutate]);

  return {
    loading,
    signOutDialogOpen: data && !currentAddress ,
    setSignOutDialogOpen,
  };
}