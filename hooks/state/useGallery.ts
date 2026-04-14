import { useCallback } from 'react';
import useSWR from 'swr';

export interface GalleryState {
  galleryItemType: 'gk' | 'profile';
  galleryShowMyStuff: boolean;
}

export function useGallery() {
  const { data, mutate } = useSWR('gallery',
    {
      fallbackData:
      {
        galleryItemType: 'gk',
        galleryShowMyStuff: false
      }
    });

  const loading = !data;
    
  const setGalleryItemType = useCallback((galleryItemType: 'gk' | 'profile') => {
    mutate({
      ...data,
      galleryItemType
    });
  }, [data, mutate]);

  const setGalleryShowMyStuff = useCallback((galleryShowMyStuff: boolean) => {
    mutate({
      ...data,
      galleryShowMyStuff
    });
  }, [data, mutate]);

  return {
    loading,
    galleryItemType: data.galleryItemType,
    galleryShowMyStuff: data.galleryShowMyStuff,
    setGalleryItemType,
    setGalleryShowMyStuff
  };
}