
import { cl } from 'utils/tw';

import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { PropsWithChildren } from 'react';

export interface LoadedContainerProps {
  children: ReactNode;
  loaded: boolean;
  durationSec?: number;
  showLoader?: boolean;
  fitToParent?: boolean;
  // todo: support different animation variants
  newLoader?: boolean
}

const DynamicLoader = dynamic(() => import('./Loader'));

export const LoadedContainer: React.FC<LoadedContainerProps> = ({ children, durationSec, fitToParent = true, loaded, showLoader, newLoader }: PropsWithChildren<LoadedContainerProps>) => {
  return (
    <AnimatePresence>
      {newLoader ?
        !loaded && showLoader !== false &&
        <div className={cl('flex justify-center py-10', { 'h-full w-full': fitToParent })} >
          <DynamicLoader stroke='stroke-[#707070]' size='h-32' />
        </div>
        :
        !loaded && showLoader !== false && <DynamicLoader />
      }

      {
        loaded && <motion.div
          className={cl({ 'h-full w-full': fitToParent })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: 'easeInOut', duration: durationSec ?? 0.3 }}
        >
          {children}
        </motion.div>
      }
    </AnimatePresence >
  );
};
