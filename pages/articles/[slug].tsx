import DefaultLayout from 'components/layouts/DefaultLayout';
import BlogHeader from 'components/modules/BlogPage/BlogHeader';
import BlogHeroImage from 'components/modules/BlogPage/BlogHeroImage';
import Markdown from 'components/modules/BlogPage/Markdown';
import contentfulBackupData from 'constants/contentful_backup_data.json';
import NotFoundPage from 'pages/404';
import { PostData } from 'types/blogs';

import { getPost } from 'lib/contentful/api';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { CaretLeft } from 'phosphor-react';

type PostProps = {
  post: PostData;
  preview: boolean;
};

const DynamicRelatedPostCard = dynamic(() => import('components/modules/BlogPage/RelatedPostsCard'));
const DynamicPreviewBanner = dynamic(() => import('components/elements/PreviewBanner'));

export default function Post({ post, preview }: PostProps) {
  const router = useRouter();

  if (!router.isFallback && !post) {
    return <NotFoundPage />;
  }

  const seoConfig = {
    title:post?.title,
    description:post?.description,
    openGraph: {
      url: `https://www.nft.com/articles/${post?.slug}`,
      title: post?.title,
      description: post?.description,
      type: 'article',
      article: {
        publishedTime: post?.publishDate,
        tags: post?.tags,
      },
      images: [
        {
          url: post?.heroImage?.url,
          alt: post?.heroImage?.description,
        },
      ],
      site_name: 'NFT.com',
    },
  };

  return (
    <>
      <NextSeo {...seoConfig}/>
      <div className='bg-white'>
        <div className="relative text-center px-4 w-full minlg:pt-28 max-w-nftcom mx-auto">
          <Link href="/articles">
            <div className='flex content-center items-center hover:cursor-pointer mb-4 minmd:mb-0'>
              <CaretLeft className='mr-1 text-black' />
              <p className='font-noi-grotesk text-black text-sm minmd:text-base'>Back to Blog</p>
            </div>
          </Link>

          <BlogHeader post={post} />

          <BlogHeroImage
            src={post?.heroImage.url}
            alt={post?.heroImage.description}
          />
          <div className="text-left minlg:mt-12 mt-8 mx-auto pb-5 minxl:w-8/12 minlg:w-3/4 w-full">
            <Markdown content={post?.body} />
          </div>
          {post?.relatedPostsCollection?.items.length
            ? (
              <div>
                <h2 className="text-left minmd:mb-6 mb-3 font-medium minlg:mt-8 minmd:mt-4 mt-1.5 minlg:text-3xll minmd:text-xl text-sm">
                Related Posts
                </h2>
                <div className="grid minmd:gap-x-4 gap-x-3 gap-y-7 minlg:grid-cols-3 grid-cols-2 minxl:pb-24 pb-12">
                  {post.relatedPostsCollection.items.map((post) => (
                    post && <DynamicRelatedPostCard key={post?.sys.id} post={post} />
                  ))}
                </div>
              </div>
            )
            : null}
        </div>
      </div>
      {preview && <DynamicPreviewBanner />}
    </>
  );
}

Post.getLayout = function getLayout(page) {
  return (
    <DefaultLayout>
      { page }
    </DefaultLayout>
  );
};

export async function getServerSideProps({ params, preview = false }) {
  const data = await getPost(params.slug, preview);
  return {
    props: {
      post: data?.post ?? contentfulBackupData[2].items.find(item => item.slug == params.slug),
      preview
    },
  };
}
