import { useCallback } from 'react';
import useSWR from 'swr';

export function useEmailCaptureModal() {
  const { data, mutate } = useSWR('emailCaptureModal', { fallbackData: false });

  const loading = !data;
  const useToggleEmailCaptureModal = useCallback(() => {
    mutate(!data);
  }, [data, mutate]);

  const setEmailCaptureModalOpen = useCallback((open: boolean) => {
    mutate(open);
  }, [mutate]);

  return {
    loading,
    emailCaptureModal: data,
    useToggleEmailCaptureModal,
    setEmailCaptureModalOpen,
  };
}