import { useCallback } from 'react';
import useSWR from 'swr';

export function useMobileSidebar() {
  const { data, mutate } = useSWR('mobilesidebar', { fallbackData: false });

  const loading = !data;
  const useToggleMobileSidebar = () => {
    mutate(!data);
  };

  const setMobileSidebarOpen = useCallback((open: boolean) => {
    mutate(open);
  }, [mutate]);

  return {
    loading,
    mobileSidebarOpen: data,
    toggleMobileSidebar: useToggleMobileSidebar,
    setMobileSidebarOpen,
  };
}

