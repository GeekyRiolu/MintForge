import Link from 'next/link';

export default function MintProfileCardSkeleton() {
  return (
    <div className='relative mt-16 minlg:mt-12 z-50'>
      <div>
        <div className='bg-gray-300 h-10 animate-pulse rounded-xl'></div>
        <div className='bg-gray-300 h-8 animate-pulse mt-9 rounded-xl'></div>

        <div className='bg-gray-300 h-8 animate-pulse mt-9 rounded-xl'></div>
        <div className='mt-12 minlg:mt-[59px]'>
          <div className='bg-gray-300 h-16 animate-pulse rounded-xl'></div>
        </div>
        <Link href='https://docs.nft.com/nft-profiles/what-is-a-nft-profile' passHref className='mt-4'>
          <p className='text-[#727272] text-left minlg:text-center mt-4 text-xl minlg:text-base font-normal'>
            Learn more about <span className='text-black inline font-medium'>NFT Profiles</span>
          </p>
        </Link>
      </div>
    </div>
  );
}
