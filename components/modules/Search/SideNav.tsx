import { useSearchModal } from 'hooks/state/useSearchModal';
import { tw } from 'utils/tw';

import { CollectionsFiltersContent } from './CollectionsFiltersContent';
import { NFTsFiltersContent as StaticNFTsFiltersContent } from './NFTsFiltersContent';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

export interface OptionNavProps {
  title?: string;
  icon: string | any;
  onOptionNav?: () => void
  backgroundColor?: string;
  filtersData?: any;
}

const DynamicNFTsFiltersContent = dynamic<React.ComponentProps<typeof StaticNFTsFiltersContent>>(() => import('./NFTsFiltersContent').then(mod => mod.NFTsFiltersContent));

export const SideNav = (props: {
  onSideNav: (term: string) => void,
  filtersData?: any,
  isCollectionView?: boolean
}) => {
  const { sideNavOpen, setSearchFilters } = useSearchModal();

  useEffect(() => {
    setSearchFilters(props.filtersData);
  }, [props.filtersData, setSearchFilters]);

  return(
    <motion.div
      animate={{
        x: sideNavOpen ? 0 : -310 }}
      transition={{ duration: 0.2 }}
      className={tw(
        'w-[19rem]',
        sideNavOpen ? 'pr-6': '-ml-[19rem]')}
    >
      {!props.isCollectionView
        ? (
          <>
            {props.filtersData?.length > 0 && <DynamicNFTsFiltersContent />}
          </>
        )
        : (
          <CollectionsFiltersContent />
        )}
    </motion.div>
  );
};
