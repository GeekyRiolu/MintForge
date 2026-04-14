import { useSearchModal } from 'hooks/state/useSearchModal';
import { tw } from 'utils/tw';

import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

export const CuratedCollectionsFilter = (props: {onClick: (term: string) => void, collapsed?: boolean}) => {
  const { setSearchModalOpen, curatedCollections, setSelectedCuratedCollection, selectedCuratedCollection } = useSearchModal();
  const router = useRouter();
  return (
    <div className="pb-[10px] border-b-[1px] border-[#F2F2F2]">
      <div className="flex flex-col items-center pt-2">
        <motion.div
          animate={{
            height: props.collapsed ? 0 : 'auto' }}
          transition={{ duration: 0.2 }}
          className={tw('overflow-hidden px-7 minmd:px-44 minlg:px-0 mx-auto')}
        >
          <div className="flex flex-wrap justify-start minlg:justify-start items-center h-fit ">
            {curatedCollections && curatedCollections.map((tab, index) =>{
              return (
                <span
                  key={index}
                  className={tw(
                    'border border-gray-300 font-noi-grotesk text-sm',
                    'rounded-3xl mr-2 mb-2 py-2 px-3.5 h-fit hover:cursor-pointer',
                    !router.pathname.includes('discover/') && selectedCuratedCollection?.tabTitle === tab.tabTitle ? 'bg-[#000] text-white font-black': 'bg-pagebg text-blog-text-reskin font-bold' )}
                  onClick={() => {
                    setSelectedCuratedCollection(tab);
                    if (router.pathname.includes('discover/')) {
                      router.push('/app/discover');
                    }
                  }}>
                  {tab.tabTitle}
                </span>
              );
            })}
            <span
              className="block minlg:hidden font-noi-grotesk font-bold text-blog-text-reskin text-sm border border-gray-300 rounded-3xl bg-pagebg py-2 px-3.5 h-fit mb-3 hover:cursor-pointer mx-auto"
              onClick={() => {
                setSearchModalOpen(true);
              }}>
                  Discover by keyword
            </span>
          </div>
        </motion.div>
      </div>
    </div>);
};
