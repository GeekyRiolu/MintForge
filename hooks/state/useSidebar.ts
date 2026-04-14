import { useCallback } from 'react';
import useSWR from 'swr';

export function useSidebar() {
  const { data, mutate } = useSWR('sidebar', { fallbackData: false });

  const loading = !data;
  const useToggleSidebar = () => {
    mutate(!data);
  };

  const setSidebarOpen = useCallback((open: boolean) => {
    mutate(open);
  }, [mutate]);

  return {
    loading,
    sidebarOpen: data,
    toggleSidebar: useToggleSidebar,
    setSidebarOpen,
  };
}

