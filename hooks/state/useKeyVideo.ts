import { useCallback } from 'react';
import useSWR from 'swr';

export function useKeyVideo() {
  const { data, mutate } = useSWR('keyVideo', { fallbackData: false });

  const loading = !data;
  
  const useKeyVideoToggle = useCallback(() => {
    mutate(!data);
  }, [data, mutate]);

  return {
    loading,
    keyVideoVisible: data,
    useKeyVideoToggle,
  };
}