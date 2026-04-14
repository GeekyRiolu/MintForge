import { useCallback } from 'react';
import useSWR from 'swr';

export function useAddFundsDialog() {
  const { data, mutate } = useSWR('addFundsDialog', { fallbackData: false });

  const loading = !data;
  const useToggleAddFundsDialog = useCallback(() => {
    mutate(!data);
  }, [data, mutate]);

  const setAddFundsDialogOpen = useCallback((open: boolean) => {
    mutate(open);
  }, [mutate]);

  return {
    loading,
    addFundsDialogOpen: data,
    useToggleAddFundsDialog,
    setAddFundsDialogOpen,
  };
}
