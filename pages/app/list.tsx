import DefaultLayout from 'components/layouts/DefaultLayout';
import { ListingCheckout } from 'components/modules/Checkout/ListingCheckout';
import { tw } from 'utils/tw';

/**
 * Renders the entire cart for listing.
 * with configuration options for the listing side.
 */
export default function ListPage() {
  return <div className={tw(
    'w-full minmd:pt-20 flex flex-col items-center text-primary-txt dark:text-primary-txt-dk',
    'bg-white dark:bg-footer-bg-dk font-noi-grotesk px-6 minlg:px-0'
  )}>
    <ListingCheckout />
  </div>;
}

ListPage.getLayout = function getLayout(page) {
  return (
    <DefaultLayout>
      { page }
    </DefaultLayout>
  );
};