import { useCallback } from 'react';
import useSWR from 'swr';

export function useSettingsMenu() {
  const { data, mutate } = useSWR('settingsMenu', { fallbackData: false });

  const loading = !data;
  const useToggleSettingsMenu = useCallback(() => {
    mutate(!data);
  }, [data, mutate]);

  return {
    loading,
    settingsMenuOpen: data,
    useToggleSettingsMenu,
  };
}