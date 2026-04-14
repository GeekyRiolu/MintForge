import BlurImage from 'components/elements/BlurImage';
import { PostData } from 'types/blogs';

import { contentfulLoader } from 'lib/image/loader';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { readingTime } from 'reading-time-estimator';

type RelatedPostProps = {
  post: PostData;
};

export default function RelatedPostCard({ post }: RelatedPostProps) {
  const result = readingTime(post?.body || '');
  return (
    <Link href={`/articles/${post?.slug}`} passHref legacyBehavior>
      <div data-cy="blogPostCard" className="text-left	hover:cursor-pointer">
        {post?.heroImage?.url &&
          <div style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)' }} className="aspect-4/3 w-full relative rounded-md">
            <BlurImage
              className='rounded-md object-cover'
              fill
              src={post?.heroImage?.url}
              alt={post?.heroImage?.description}
              loader={contentfulLoader}
            />
          </div>
        }
        <h3 className="font-noi-grotesk font-bold minxl:text-xl minlg:text-lg minmd:text-base text-sm mt-2">
          {post?.title}
        </h3>
        {post?.description && (
          <p className="font-noi-grotesk minlg:text-base text-xs mt-1 minlg:leading-5.5 leading-4 text-blog-text">
            {post.description.length > 75
              ? post.description.substring(0, 75) + '...'
              : post.description}
          </p>
        )}
        <div className="flex mt-3">
          {post?.author?.image?.url && (
            <span className="rounded-full minlg:h-9 h-7 minlg:w-9 w-7 mr-2 mt-0.5 overflow-hidden relative">
              <Image
                src={post.author.image.url}
                alt={post.author.image.description || 'Author Image'}
                loader={contentfulLoader}
                className="object-cover"
                fill
              />
            </span>
          )}
          <div>
            <p className="font-noi-grotesk minlg:text-base text-xs leading-5">
              {post?.author?.name}
            </p>
            <div className="font-noi-grotesk flex text-blog-text">
              <p className="minlg:text-sm text-xxs3">
                {moment(post?.publishDate).format('MMM Do, YYYY')}
              </p>
              <span className="mx-1 minlg:block hidden minlg:text-sm text-xxs3 ">
                .
              </span>
              {post?.body && (
                <p className="minlg:block hidden minlg:text-sm text-xxs3">
                  {result.minutes} min read
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
