import { useIsomorphicLayoutEffect } from 'hooks/utils';
import { isNullOrEmpty } from 'utils/format';
import { isBase64 } from 'utils/image';
import { cl } from 'utils/tw';

import { generateSrcSet } from 'lib/image/loader';
import { nftComCdnLoader } from 'lib/image/loader';
import dynamic from 'next/dynamic';
import { ImageLoader } from 'next/image';
import React, { useState } from 'react';

const BlurImage = dynamic(import('components/elements/BlurImage'));
const DynamicRoundedCornerMediaImage = dynamic(import('components/elements/RoundedCornerMediaImage'));

export enum RoundedCornerVariant {
  TopOnly = 'topOnly',
  TopLeft = 'topleft',
  TopRight = 'topright',
  BottomLeft = 'bottomleft',
  BottomRight = 'bottomright',
  Left = 'left',
  Right = 'right',
  All = 'all',
  Full = 'full',
  Asset = 'asset',
  Success = 'success',
  None = 'none',
}

export enum RoundedCornerAmount {
  Medium = 'Medium',
  Default = 'Default'
}

export interface RoundedCornerMediaProps {
  src: string;
  sizes?: string;
  priority?: boolean;
  fallbackImage?: string;
  loader?: ImageLoader;
  variant: RoundedCornerVariant;
  amount?: RoundedCornerAmount;
  width?: number;
  height?: number;
  videoOverride?: boolean;
  extraClasses?: string;
  containerClasses?: string;
  onClick?: () => void;
  objectFit?: 'contain' | 'cover';
}

/**
 * Returns a string of CSS classes for a given rounded corner variant and amount.
 * @param {RoundedCornerVariant} variant - The variant of the rounded corner.
 * @param {RoundedCornerAmount} amount - The amount of rounding to apply.
 * @returns {string} A string of CSS classes to apply to the element.
 */
export const getRoundedClass = (variant: RoundedCornerVariant, amount: RoundedCornerAmount): string => {
  const isMedium = amount === RoundedCornerAmount.Medium;
  const classOptions = {
    [RoundedCornerVariant.TopOnly]: cl('object-cover', { 'rounded-t-md': isMedium, 'rounded-t-3xl': !isMedium }),
    [RoundedCornerVariant.TopLeft]: isMedium ? 'rounded-tl-md' : 'rounded-tl-3xl',
    [RoundedCornerVariant.TopRight]: isMedium ? 'rounded-tr-md' : 'rounded-tr-3xl',
    [RoundedCornerVariant.BottomLeft]: isMedium ? 'rounded-bl-md' : 'rounded-bl-3xl',
    [RoundedCornerVariant.BottomRight]: isMedium ? 'rounded-br-md' : 'rounded-br-3xl',
    [RoundedCornerVariant.Right]: isMedium ? 'rounded-r-md' : 'rounded-r-3xl',
    [RoundedCornerVariant.Left]: isMedium ? 'rounded-l-md' : 'rounded-l-3xl',
    [RoundedCornerVariant.All]: cl('object-cover', { 'rounded-md': isMedium, 'rounded-3xl': !isMedium }),
    [RoundedCornerVariant.Asset]: 'rounded-[6px]',
    [RoundedCornerVariant.Success]: 'rounded-[18px]',
    [RoundedCornerVariant.Full]: 'rounded-full object-cover',
    [RoundedCornerVariant.None]: ''
  };
  return classOptions[variant] || classOptions[RoundedCornerVariant.None];
};

export type RoundedCornerMediaLoaderProps = { classes?: string; }
export const RoundedCornerMediaLoader: React.FC<RoundedCornerMediaLoaderProps> = ({ classes }) => (
  <div
    className={classes}
  >
    <div className={cl(
      'animate-pulse bg-gray-300',
      'rounded-md',
      'object-contain'

    )} />
  </div>
);

export const RoundedCornerMedia = React.memo(function RoundedCornerMedia({
  amount,
  containerClasses,
  extraClasses,
  fallbackImage,
  loader,
  objectFit,
  onClick,
  priority,
  sizes,
  src,
  variant,
  videoOverride
}: RoundedCornerMediaProps) {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const defaultImgloader = loader || nftComCdnLoader;
  const imageUrl = imageSrc || src;
  const isFallback = !isNullOrEmpty(fallbackImage);
  const isPresetWidth = src?.includes('?width=600');
  const url = src?.split('?')[0];
  const ext = url?.split('.').pop();

  // Fire once before component is rendered
  useIsomorphicLayoutEffect(() => {
    if(isPresetWidth){
      setImageSrc(src);
    } else {
      if(ext === 'svg') {
        setImageSrc(url);
      } else {
        setImageSrc(src);
      }
    }
  }, [src, ext, url]);

  // Styling Helpers
  const roundedClasses = getRoundedClass(variant, amount ?? RoundedCornerAmount.Default);
  const isContained = objectFit === 'contain';
  const baseClasses = cl(
    'absolute w-full h-full justify-center object-cover',
    {
      'minmd:object-contain': isContained,
    },
    roundedClasses,
    extraClasses
  );

  const rawImageBool = (imageUrl?.indexOf('cdn.nft.com') >= 0 && imageUrl?.indexOf('.svg') >= 0) ||
  imageUrl?.indexOf('ens.domains') >= 0 ||
  (imageUrl?.indexOf('storage.googleapis.com') >= 0 && imageUrl?.indexOf('.svg') >= 0);
  const isVideo = (videoOverride || imageUrl?.indexOf('data:') >= 0);
  const videoSrcs = videoOverride || isVideo ? generateSrcSet(src) : null;
  const isBase64Image = videoSrcs ? isBase64(src) : false;

  const renderRawImage = (imageSrc?: string) => (
    <BlurImage
      alt='NFT Image'
      key={src}
      src={imageSrc || imageUrl}
      fill
      loader={loader}
      className={baseClasses}
    />);

  return (
    <div className={cl(
      'relative object-cover aspect-square overflow-hidden',
      roundedClasses,
      containerClasses
    )}
    onClick={onClick}
    >
      { isVideo ?
        <>
          {loading &&
            <RoundedCornerMediaLoader classes={cl(baseClasses, 'items-center !aspect-square')} />
          }
          {isBase64Image
            ? (
              <BlurImage
                alt='NFT Image'
                placeholder='empty'
                src={videoSrcs.src}
                fill
                className={cl(baseClasses, 'aspect-square')}
              />)
            : (
              <video
                autoPlay
                muted={!videoOverride}
                loop
                key={src}
                poster={videoSrcs?.src}
                onLoadedData={() => setLoading(false)}
                className={cl(baseClasses, 'aspect-square')}
              />)}
          {/* { // TODO: Support adding media/file types if we add video/audio support
              videoSrcs?.srcs.map(src => (<source src={src} key={src} />))
            }
          </video> */}
        </>
        : rawImageBool
          ? renderRawImage()
          :
          (imageUrl != 'null?width=600') && <DynamicRoundedCornerMediaImage
            priority={priority}
            src={imageUrl}
            sizes={sizes}
            width={300}
            loader={defaultImgloader}
            onError={() => {
              setImageSrc(isFallback ? fallbackImage : isPresetWidth ? src?.split('?')[0] : src);
            }}
            className={baseClasses}
          />
      }
    </div>
  );
});
