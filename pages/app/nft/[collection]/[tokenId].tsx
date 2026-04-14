import DefaultSEO from 'config/next-seo.config';
import ClientOnly from 'components/elements/ClientOnly';
import LoaderPageFallback from 'components/elements/Loader/LoaderPageFallback';
import DefaultLayout from 'components/layouts/DefaultLayout';
import { NftResponse } from 'graphql/hooks/useNFTQuery';
import NotFoundPage from 'pages/404';
import { isNullOrEmpty } from 'utils/format';
import { isValidContractSimple } from 'utils/helpers';

import { getNftPage } from 'lib/graphql-ssr/nft';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { SWRConfig } from 'swr';

const NFTDetailPage =
  dynamic(() => import('components/modules/NFTDetail/NFTDetailPage').then(mod => mod.NFTDetailPage), { loading: () => <LoaderPageFallback /> });

export default function NftPage({ fallback }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { collection, tokenId } = router.query;

  const nft = Object.values(fallback)[0] ?? {};
  const seoTitle = `NFT: ${nft?.metadata?.name}`;
  const seoConfig = {
    ...DefaultSEO,
    title: seoTitle,
    description: nft?.metadata?.description,
    openGraph: {
      url: `https://www.nft.com/app/nft/${collection}/${tokenId}`,
      title: seoTitle,
      description: nft?.metadata?.description,
      images: [
        {
          url: nft?.metadata?.imageURL,
          alt: `${nft?.metadata?.name} - NFT`,
        },
      ],
      site_name: 'NFT.com',
    }
  };

  if (collection === undefined || tokenId === undefined) {
    return <LoaderPageFallback />;
  }

  if (
    [
      isNullOrEmpty(collection),
      isNullOrEmpty(tokenId),
      !isValidContractSimple(collection as string)
    ].includes(true)
  ) {
    return <NotFoundPage />;
  }

  return <SWRConfig value={fallback}>
    <NextSeo
      {...seoConfig}
    />
    <ClientOnly>
      <NFTDetailPage
        collection={collection as string}
        tokenId={tokenId as string}
      />
    </ClientOnly>
  </SWRConfig>;
}

NftPage.getLayout = function getLayout(page) {
  return (
    <DefaultLayout>
      {page}
    </DefaultLayout>
  );
};

export const getServerSideProps: GetServerSideProps<{
  fallback: {
    [x: string]: NftResponse,
  }
}> = async ({ params }) => {
  return await getNftPage(params);
};
