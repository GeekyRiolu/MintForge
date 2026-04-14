import { PostData } from 'types/blogs';

import BlogSliderCard from './BlogSliderCard';

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback,useEffect, useState } from 'react';

type BlogSliderProps = {
  posts: PostData[];
};

export default function BlogSlider({ posts }:BlogSliderProps) {
  const options = { delay: 5000, rootNode: (emblaRoot) => emblaRoot.parentElement };
  const autoplay = Autoplay(options);
  const [emblaRef, embla] = useEmblaCarousel({
    align: 'start',
    loop: false,
    skipSnaps: false,
    inViewThreshold: 0.7,
  }, [autoplay]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollTo = useCallback(
    (index) => embla && embla.scrollTo(index),
    [embla]
  );

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
  }, [embla, setSelectedIndex]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    setScrollSnaps(embla.scrollSnapList());
    embla.on('select', onSelect);
  }, [embla, setScrollSnaps, onSelect]);

  return (
    <div data-cy="blogSlider" className="relative mx-auto px-2.5 bg-[#4C4313] p-3 rounded-2xl overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {posts?.map((post) => (
            <BlogSliderCard key={post?.sys.id} post={post} />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center mt-5 space-x-2">
        {scrollSnaps.map((_, idx) => (
          <div className={`w-3 h-3 bg-[#4C4313] border rounded-full flex justify-center items-center ${
            idx === selectedIndex ? 'border-[#F9D963]' : 'none'
          }`} key={idx} >
            <button
              className={`w-2 h-2 rounded-full ${
                idx === selectedIndex ? 'bg-[#F9D963]' : 'bg-[#B7C6CE]'
              }`}
              onClick={() => scrollTo(idx)}
            />
          </div>
        ))}
      </div>
      <div className='absolute bottom-0 minxl:-right-16 minlg:-right-20 -right-24 w-28 h-96 max-h-3/5 bg-gradient-to-t from-[#F9D963] to-[#F6BE54] opacity-10  row-span-2 mt-48 -skew-x-[17deg]'></div>
    </div>
  );
}
