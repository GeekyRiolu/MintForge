import { RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { ExternalProtocol } from 'types';
import { tw } from 'utils/tw';

import { StagedListing } from './NFTListingsContext';
import { PartialErrorItem } from './PartialErrorItem';

import LooksrareIcon from 'public/icons/looksrare-icon.svg?svgr';
import NFTLogo from 'public/icons/nft_logo_yellow.svg?svgr';
import OpenseaIcon from 'public/icons/opensea-icon.svg?svgr';
import X2Y2Icon from 'public/icons/x2y2-icon.svg?svgr';

export interface PartialErrorViewProps {
  listing: StagedListing
}

export function PartialErrorView({ listing } : PartialErrorViewProps) {
  return (
    <>
      <div>
        <div className={tw(
          'bg-[#F8F8F8] p-[10px] rounded flex',
          listing.targets.some((target) => target.listingError) && 'bg-[#FFF8F7] border border-[#E43D20]'
        )}
        key={listing.nft?.metadata?.name}>
          <RoundedCornerMedia
            containerClasses='w-[82px] h-[82px] z-10 mr-5'
            src={listing?.nft?.metadata?.imageURL}
            variant={RoundedCornerVariant.Success}
          />
          <div className='w-full'>
            <div className='flex flex-col minmd:flex-row justify-between'>
              <div className='mt-2'>
                <p className='font-medium text-sm truncate'>{listing.nft?.metadata?.name}</p>
                <p className='text-xs text-[#6A6A6A] truncate'>{listing.collectionName}</p>
              </div>
              <div>
                <div className='flex flex-row items-center'>
                  {listing?.targets?.some(t => !t.listingError) &&
                    <p className='font-medium text-xs text-[#26AA73] mt-1 mr-1.5'>
                      Completed
                    </p>
                  }
                  <div className='flex flex-row -space-x-2'>
                    {listing.targets.map((target) => (
                      !target.listingError &&
                    <>
                      {target.protocol === ExternalProtocol.Seaport && <OpenseaIcon
                        className='h-7 w-7 -mr-1 relative shrink-0 rounded-full -outline-offset-4 outline outline-2 outline-[#F8F8F8]'
                        alt="Opensea logo redirect"
                        layout="fill"
                      />}
                      {target.protocol === ExternalProtocol.LooksRare && <LooksrareIcon
                        className='h-7 w-7 -mr-1 relative shrink-0 rounded-full -outline-offset-4 outline outline-2 outline-[#F8F8F8]'
                        alt="Opensea logo redirect"
                        layout="fill"
                      />}
                      {target.protocol === ExternalProtocol.NFTCOM && <NFTLogo
                        className='h-6 w-6 mt-0.5 relative shrink-0 rounded-full border-2 border-[#F8F8F8]'
                        alt="Opensea logo redirect"
                        layout="fill"
                      />}
                      {target.protocol === ExternalProtocol.X2Y2 && <X2Y2Icon
                        className='h-6 w-6 mt-0.5 relative shrink-0 rounded-full border-2 border-[#F8F8F8]'
                        alt="Opensea logo redirect"
                        layout="fill"
                      />}
                    </>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-col'>
              {listing.targets.map((target, index) => (
                target.listingError &&
                <PartialErrorItem key={`listingError-${index}`} listing={listing} target={target} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
