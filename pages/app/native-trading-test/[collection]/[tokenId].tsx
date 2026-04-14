import Loader from 'components/elements/Loader/Loader';
import DefaultLayout from 'components/layouts/DefaultLayout';
import { NFTDetailPage } from 'components/modules/NFTDetail/NFTDetailPage';
import NotFoundPage from 'pages/404';
import { isNullOrEmpty } from 'utils/format';
import { tw } from 'utils/tw';

import { BigNumber } from 'ethers';
import { useRouter } from 'next/router';

/**
 * Shows a public profile e.g. nft.com/satoshi
 */
export default function ProfileURI() {
  const router = useRouter();
  const { collection, tokenId } = router.query;
  const validCollectionReg = /^0x[a-fA-F0-9]{40}$/;

  if (collection === undefined || tokenId === undefined) {
    return (<div className={tw(
      'text-primary-txt dark:text-primary-txt-dk flex flex-col',
      'items-center justify-center h-screen'
    )}>
      <div className="mb-2">Loading...</div>
      <Loader />
    </div>);
  } else if (
    isNullOrEmpty(collection) ||
    isNullOrEmpty(tokenId) ||
    !validCollectionReg.test(collection as string)
  ) {
    return <NotFoundPage />;
  } else {
    return <NFTDetailPage collection={collection as string} tokenId={BigNumber.from(tokenId).toHexString()} />;
  }
}

ProfileURI.getLayout = function getLayout(page) {
  return (
    <DefaultLayout>
      {page}
    </DefaultLayout>
  );
};
