import ClientOnly from 'components/elements/ClientOnly';
import { PostData } from 'types/blogs';

import SharingIcons from './SharingIcons';

import { contentfulLoader } from 'lib/image/loader';
import moment from 'moment';
import Image from 'next/image';
import { readingTime } from 'reading-time-estimator';

type HeaderProps = {
  post: PostData;
};

export default function BlogHeader({ post }: HeaderProps) {
  const result = readingTime(post?.body);
  return (
    <>
      <h2 className="font-noi-grotesk font-bold mx-auto text-lg minmd:text-2xl minlg:text-4xl minmd:mb-0 mb-3 max-w-2xl minlg:leading-5.5 leading-6 tracking-wider minlg:px-0 px-10">
        {post?.title}
      </h2>
      {post?.author?.image?.url && (
        <div className="mb-4 minlg:mt-4 mt-3 mx-auto rounded-full overflow-hidden relative minlg:h-12 h-9 minlg:w-12 w-9">
          <Image
            src={post.author.image.url}
            alt={post.author.image.description || 'Author Image'}
            className="object-contain"
            loader={contentfulLoader}
            fill
          />
        </div>
      )}
      <p data-cy="author" className="font-noi-grotesk mt-2 minlg:text-xl text-base leading-4 tracking-wider">
        {post?.author?.name}
      </p>

      {post && (
        <div className="font-noi-grotesk relative flex justify-center minlg:mt-2 mt-0.5 minlg:pb-7 pb-8 minlg:mb-5 mb-2.5 text-sm text-blog-text-reskin leading-3 tracking-wider">
          <p data-cy="date">{moment(post?.publishDate).format('MMM Do, YYYY')}</p>
          <span className="mx-1">.</span>
          {post?.body && <p data-cy="time">{result.minutes} min read</p>}
          <ClientOnly>
            <SharingIcons
              title={post?.title}
            />
          </ClientOnly>
        </div>
      )}
    </>
  );
}
