import { RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { useSearchModal } from 'hooks/state/useSearchModal';
import { tw } from 'utils/tw';

import { useRouter } from 'next/router';
import { Image } from 'phosphor-react';
import GK from 'public/icons/Badge_Key.svg?svgr';
import VerifiedIcon from 'public/icons/verifiedIcon.svg?svgr';

interface ResultsDropDownDisplayProps {
  isHeader?: any;
  searchResults: any[],
  resultTitleOnClick?: (collectionName: string) => void,
  itemListOnClick?: (document: any) => void,
  extraClasses?: string
  seeAll?: boolean
}

export const ResultsDropDownDisplay = ({ isHeader, searchResults, resultTitleOnClick, itemListOnClick, extraClasses, seeAll }: ResultsDropDownDisplayProps) => {
  const { setClearedFilters } = useSearchModal();

  const router = useRouter();
  const copy = [...searchResults];
  const nfts = copy.map(item => item);
  const newData = [
    searchResults[1],
    nfts[0]
  ];
  const { keyword, setDropDownSearchResults } = useSearchModal();
  const clickByItemResult = (hit) => {
    setDropDownSearchResults([], '');
    itemListOnClick && itemListOnClick(hit.document);
  };
  const resultTitle = (found, collectionName) => {
    let title = '';

    if (found < 1 && collectionName !== '')
      title = 'O ' + collectionName?.toUpperCase();
    else if (found === 1) {
      title = found + ' ' + collectionName?.substring(0, collectionName.length-1).toUpperCase();
    } else {
      title = found + ' ' + collectionName?.toUpperCase();
    }
    return (
      <div className={tw(
        'flex justify-between',
        'text-lg text-blog-text-reskin font-medium py-3 px-8')}>
        <span className="text-[#B2B2B2]">{title}</span>
        {
          seeAll && <span
            className="cursor-pointer hover:font-semibold underline text-black"
            onClick={() => {
              router.push(`/app/discover/${collectionName}/${keyword}`);
              setClearedFilters();
              setDropDownSearchResults([], '');
              resultTitleOnClick && resultTitleOnClick(collectionName);
            }}
          >
            See All
          </span>
        }
      </div>
    );
  };
  const ResultsContent = () => {
    return newData && newData.length > 0 && newData.filter(Boolean).map((item, index) => {
      const name = item?.request_params?.collection_name.split('-');
      return (
        <div key={index}>
          {resultTitle(item.found, name && name[0])}
          <div className="flex flex-col items-start" key={index}>
            {item.hits.length === 0 ?
              <div className={tw('text-sm py-3 text-gray-500 px-9')}>
                No {name && name[0]?.toLowerCase()} results
              </div>
              : (item?.hits?.map((hit, index) => {
                return (
                  <div
                    className="hover:cursor-pointer hover:bg-gray-100 w-full"
                    key={index}>
                    <div
                      className={tw(
                        'px-8',
                        'items-start py-1 w-full',
                        'text-sm font-semibold text-black',
                        'flex justify-start items-center whitespace-nowrap text-ellipsis overflow-hidden')}
                      onClick={() => clickByItemResult(hit)}>
                      {hit.document.imageURL || hit.document.logoUrl ?
                        <div className="relative min-w-[48px] w-[48px] h-[48px] rounded-[16px] mr-2 overflow-hidden">
                          <RoundedCornerMedia
                            variant={RoundedCornerVariant.None}
                            width={600}
                            height={600}
                            containerClasses='w-[100%] h-[100%]'
                            extraClasses='hover:scale-105 transition'
                            src={name && name[0] === 'collections' ? hit.document.logoUrl : hit?.document?.imageURL}
                          />
                        </div>
                        : <div className="min-w-[48px] w-[48px] h-[48px] rounded-[50%] mr-2 bg-[#F2F2F2] flex justify-center items-center"><Image alt="preloader" color={'#B2B2B2'} size={32} /></div>}
                      <span className="flex items-center text-base overflow-hidden text-ellipsis whitespace-nowrap font-[500]">
                        {
                          hit.document.isProfile ? <span className="text-[#F9D54C] text-xl font-bold">/ </span> : null
                        }
                        {hit.document.nftName ?? hit.document.contractName}
                        {hit.document?.isOfficial && <VerifiedIcon className='inline ml-2'/>}
                        {hit.document.isProfileGKMinted && <div className='h-6 w-6 ml-2'>
                          <GK />
                        </div>}
                      </span>
                    </div>
                  </div>
                );
              }))}
          </div>
        </div>
      );
    });
  };
  return (
    <div
      className={tw(
        isHeader ? 'absolute left-0 max-w-[27rem] z-[51]' : '',
        'flex flex-col w-full font-noi-grotesk',
        extraClasses)}>
      {searchResults.length > 0 && <>
        {searchResults[0].found === 0 && searchResults[1].found === 0 ?
          (<div className="bg-white mt-10 self-center text-base font-medium text-gray-500 pb-4 text-center">
            No results found. Please try another keyword.
          </div>) :
          <div className="bg-white py-4 rounded-b-2xl shadow-lg">
            {ResultsContent()}
          </div>
        }
      </>}
    </div>
  );
};
