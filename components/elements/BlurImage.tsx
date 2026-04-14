import { defaultBlurPlaceholderUrl, getBase64Image } from 'utils/image';
import { cl } from 'utils/tw';

import { nftComCdnLoader } from 'lib/image/loader';
import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type BlurImageProps = {
  className?: string;
  fallbackImage?: any;
  localImage?: boolean;
} & Omit<ImageProps, 'src'> & Partial<Pick<ImageProps, 'src'>>

export default function BlurImage({
  alt,
  className,
  loader,
  width,
  height,
  fill,
  src,
  sizes,
  localImage = false,
  ...props
} : BlurImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const blurLoader = src && !localImage ? (loader || nftComCdnLoader) : undefined;
  const layoutProps = fill ?
    {
      fill,
      sizes: sizes ?? '100vw',
    }
    : {
      width,
      height
    };
  // Support base64 encoded images
  if (src) {
    src = getBase64Image(src as string);
  }

  return (
    <Image
      alt={alt}
      loader={blurLoader}
      placeholder="blur"
      src={src ?? defaultBlurPlaceholderUrl}
      blurDataURL={defaultBlurPlaceholderUrl}
      className={cl(
        'duration-500 ease-in-out',
        isLoading
          ? 'blur scale-110 animate-pulse'
          : 'blur-none scale-100',
        className,
      )}
      onLoadingComplete={() => setIsLoading(false)}
      {...props}
      {...layoutProps}
    />
  );
}
