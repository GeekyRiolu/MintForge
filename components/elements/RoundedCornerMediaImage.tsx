import dynamic from 'next/dynamic';
import { ImageProps } from 'next/image';

const BlurImage = dynamic(import('./BlurImage'));

export interface RoundedCornerMediaImageProps extends Omit<ImageProps, 'alt'> {
  alt?: string;
  src: any;
  priority?: boolean;
  onError: () => void;
  className: string;
}

const RoundedCornerMediaImage = (props: RoundedCornerMediaImageProps) => {
  return (
    <BlurImage
      alt='NFT Image'
      key={props.src}
      quality='50'
      fill
      {...props}
    />
  );
};

export default RoundedCornerMediaImage;
