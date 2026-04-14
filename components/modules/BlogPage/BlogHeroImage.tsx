import { contentfulLoader } from 'lib/image/loader';
import Image from 'next/image';

type HeroProps = {
  src: string;
  alt: string;
};

export default function BlogHeroImage({ src, alt }: HeroProps) {
  return (
    <div className="aspect-video minxl:h-blogHero-xl minlg:h-blogHero-lg w-full relative overflow-hidden pb-4 rounded-md border border-gray-100/50 drop-shadow-md">
      <Image
        src={src}
        alt={alt}
        className="object-cover"
        loader={contentfulLoader}
        fill
      />
    </div>
  );
}
