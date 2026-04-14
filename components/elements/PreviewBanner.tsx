import Link from 'next/link';
import { useRouter } from 'next/router';

function PreviewBanner() {
  const router = useRouter();
  return (
    <div
      className='flex text-sm h-16 bg-black dark:bg-white text-white dark:text-black w-full justify-center items-center minmd:gap-16 gap-4 fixed bottom-0 z-50'
    >
      <span>PREVIEW MODE ENABLED</span>
      <Link
        prefetch={false}
        href={`/api/cancel-preview?slug=${router?.asPath}`}
        legacyBehavior
      >
        <a
          className="bg-white dark:bg-black text-black dark:text-white rounded decoration p-2"
        >
          EXIT PREVIEW MODE
        </a>
      </Link>
    </div>
  );
}

export default PreviewBanner;
