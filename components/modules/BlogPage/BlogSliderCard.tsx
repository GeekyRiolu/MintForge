import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { PostData } from 'types/blogs';

import { contentfulLoader } from 'lib/image/loader';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { readingTime } from 'reading-time-estimator';

type BlogSliderPostProps = {
  post: PostData;
};

export default function BlogSliderCard({ post }: BlogSliderPostProps) {
  return (
    <div
      className="relative flex flex-row md:flex-col flex-none flex-nowrap w-full mx-10 p-3 bg-[#5C542A] rounded-2xl"
      key={post.title}
    >
      <div className="relative overflow-hidden cursor-pointer minlg:w-2/5 w-full minlg:aspect-square minmd:aspect-video aspect-square object-cover object-center bg-white rounded-lg">
        <Link href={`/articles/${post.slug}`} passHref legacyBehavior>
          <Image
            src={post?.heroImage.url}
            className="rounded-lg"
            alt="cover image"
            fill
            placeholder="blur"
            style={{ objectFit: 'cover' }}
            blurDataURL={post?.heroImage.url}
            loader={contentfulLoader}
          />
        </Link>
      </div>
      <div className="flex flex-col minlg:w-3/5 w-full minlg:ml-8 ml-0 minxl:pt-12 minlg:pt-2 pt-4 px-1">
        <Link href={`/articles/${post.slug}`} legacyBehavior>
          <a className="cursor-pointer">
            <h2 className="font-noi-grotesk font-bold text-white minxl:text-4xl minlg:text-3xl text-lg minmd:w-4/5 w-full">
              {post.title}
            </h2>
          </a>
        </Link>
        {post?.description && (
          <Link href={`/articles/${post.slug}`} legacyBehavior>
            <a className="cursor-pointer">
              <p className="font-noi-grotesk text-[#E1E1E1] text-justify minxl:text-xl minlg:text-lg text-sm minlg:w-11/12 minmd:w-10/12 w-full leading-8 minlg:mt-3 mt-2">
                {post?.description.length > 230
                  ? post.description.substring(0, 230) + '...'
                  : post.description}
              </p>
            </a>
          </Link>
        )}
        <div className="flex minlg:mt-4 mt-2">
          {post?.author?.image?.url && (
            <span className="rounded-full minlg:h-12 h-7 minlg:w-12 w-7 mr-2 mt-0.5 overflow-hidden relative">
              <Image
                src={post?.author?.image?.url}
                alt={post?.author?.image?.description || 'Author Image'}
                className="object-cover"
                loader={contentfulLoader}
                fill
              />
            </span>
          )}
          <div className='pt-0.5'>
            <p className="font-noi-grotesk minxl:text-xl minlg:text-lg text-sm text-white">
              {post?.author.name}
            </p>
            <div className="flex text-[#B6B6B6]">
              <p className="font-noi-grotesk minlg:text-sm text-xs">
                {moment(post?.publishDate).format('MMM Do, YYYY')}
              </p>
              <span className="mx-1 minlg:block hidden minlg:text-sm text-xxs3 ">
                .
              </span>
              {post?.body && (
                <p className="font-noi-grotesk minlg:block hidden minlg:text-sm text-xxs3">
                  {readingTime(post?.body).minutes} min read
                </p>
              )}
            </div>
          </div>
        </div>
        <div className='mt-8 minlg:mt-6'>
          <Link href={`/articles/${post.slug}`} >
            <Button
              size={ButtonSize.LARGE}
              type={ButtonType.PRIMARY}
              label='View Post'
              onClick={() => null}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
