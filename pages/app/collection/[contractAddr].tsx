import DefaultSEO from 'config/next-seo.config';
import LoaderPageFallback from 'components/elements/Loader/LoaderPageFallback';
import DefaultLayout from 'components/layouts/DefaultLayout';
import { CollectionResponse } from 'graphql/hooks/useCollectionQuery';
import NotFoundPage from 'pages/404';
import { Doppler, getEnvBool } from 'utils/env';

import { utils } from 'ethers';
import { getCollectionPage } from 'lib/graphql-ssr/collection';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import dynamicComponent from 'next/dynamic';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { SWRConfig } from 'swr';

export const dynamic = 'force-dynamic';

const Collection = dynamicComponent(() => import('components/modules/Collection/Collection').then(mod => mod.Collection), { loading: () => <LoaderPageFallback /> }); // Adds fallback while loading Collection
const CollectionBanner = dynamicComponent(() => import('components/modules/Collection/Collection').then(mod => mod.CollectionBanner));
const CollectionBody = dynamicComponent(() => import('components/modules/Collection/Collection').then(mod => mod.CollectionBody));
const CollectionDescription = dynamicComponent(() => import('components/modules/Collection/Collection').then(mod => mod.CollectionDescription));
const CollectionDetails = dynamicComponent(() => import('components/modules/Collection/Collection').then(mod => mod.CollectionDetails));
const CollectionHeader = dynamicComponent(() => import('components/modules/Collection/Collection').then(mod => mod.CollectionHeader));

export default function UnofficialCollectionPage({ fallback }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { collection: preCollection } = Object.values(fallback)[0] ?? {};
  const router = useRouter();
  const { contractAddr } = router.query;
  const caseInsensitiveAddr = contractAddr?.toString().toLowerCase();

  const seoTitle = `NFT Collection: ${preCollection?.name}`;
  const seoConfig = {
    ...DefaultSEO,
    title: seoTitle,
    description: preCollection?.description,
    openGraph: {
      url: `https://www.nft.com/app/collection/${contractAddr}`,
      title: seoTitle,
      description: preCollection?.description,
      images: [
        {
          url: preCollection?.logoUrl,
          alt: `${preCollection?.name} Logo`,
        },
      ],
      site_name: 'NFT.com',
    }
  };

  if (!utils.isAddress(caseInsensitiveAddr) || !getEnvBool(Doppler.NEXT_PUBLIC_COLLECTION_PAGE_ENABLED)) {
    return <NotFoundPage />;
  }

  return (
    <SWRConfig value={fallback}>
      <NextSeo
        {...seoConfig }
      />
      <Collection contract={contractAddr as string} >
        <CollectionBanner />
        <CollectionHeader>
          <CollectionDescription />
          <CollectionDetails />
        </CollectionHeader>
        <CollectionBody />
      </Collection >
    </SWRConfig>
  );
}

UnofficialCollectionPage.getLayout = function getLayout(page) {
  return (
    <DefaultLayout>
      {page}
    </DefaultLayout>
  );
};

export const getServerSideProps: GetServerSideProps<{
  fallback: {
    [x: string]: CollectionResponse,
  }
}> = async ({ params }) => {
  return await getCollectionPage(params);
};
