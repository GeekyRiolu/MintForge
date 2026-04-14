import Loader from 'components/elements/Loader/Loader';
import { isNullOrEmpty } from 'utils/format';
import { tw } from 'utils/tw';

import { Dialog } from '@headlessui/react';
import { XIcon } from '@heroicons/react/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

export type MultiLineTitle = { topLine: string, bottomLine: string };

export interface ModalProps {
  visible: boolean;
  loading: boolean;
  title: string | MultiLineTitle;
  subtitle?: string;
  onClose: () => void,
  // use this to remove all formatting and default content from the modal.
  pure?: boolean;
  // force dark mode
  dark?: boolean;
  longModal?: boolean;
  noCancelBtn?: boolean;
  closeBtnNoPaddings?: boolean;
  fullModal?: boolean;
  bgColor?: string;
  transparentOverlay?: boolean;
  hideX?: boolean
}

export function Modal(props: PropsWithChildren<ModalProps>) {
  return <AnimatePresence>
    {props.visible && (
      <Dialog
        as={motion.div}
        static
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: 'easeInOut', duration: 0.1 }}
        exit={{ opacity: 0, scale: 1 }}
        open={props.visible}
        className={tw(
          'inset-0 fixed',
          'overflow-y-auto sm:overflow-x-hidden',
          'max-h-screen max-w-screen',
          props.dark ? 'dark' : ''
        )}
        // todo: introduce priority system to determine the zIndex
        style={{ zIndex: 300 }}
        onClose={props.onClose}
      >
        <div className={tw(
          'absolute inset-0 flex justify-center items-center',
          'backdrop-blur-sm backdrop-opacity-80'
        )}>
          <Dialog.Overlay
            className={tw(
              'inset-0 absolute w-full h-full transition-opacity',
              props.transparentOverlay ? 'bg-transparent' : 'bg-modal-overlay/80 dark:bg-modal-overlay-dk/80'
            )}
          />
          <div
            className={tw(
              'transition-all fixed rounded-lg sm:rounded-none',
              props.pure ? '' : `pb-4 px-7 minmd:px-24 ${props.longModal ? '' : 'pt-14'}`,
              'text-left overflow-hidden shadow-xl absolute z-50 overflow-y-auto',
              'min-w-[600px] sm:min-w-[1px] sm:max-w-screen',
              'sm:overflow-x-hidden sm:overflow-y-auto',
              `${props.bgColor ?? 'bg-pagebg dark:bg-pagebg-dk'}`,
              `${props.longModal ? 'max-h-screen' : ''}`,
              `${!props.longModal ? 'min4xl:-mt-28 md:h-full' : ''}`,
              `${props.fullModal ? 'min-h-screen w-full' : 'min-w-[600px] sm:min-w-[1px] sm:max-w-screen'}`,
            )}
          >
            <div className='items-center'>
              {props.loading ?
                <Loader /> :
                <div className={`text-center ${props.longModal ? `px-6 ${props.longModal ? 'pt-8' : 'pt-20'}` : ''}`}>
                  {(typeof (props.title) !== 'string')
                    ? (
                      <Dialog.Title
                        className={tw(
                          props.pure ? 'hidden' : '',
                          'text-center font-medium text-xl minmd:text-3xl',
                          'font-noi-grotesk text-primary-txt',
                          `${props.longModal ? 'minmd:top-[-38%]' : ''}`
                        )}
                      >
                        <div className="flex flex-col">
                          <div className="minmd:h-full">
                            {typeof (props.title) !== 'string' && props.title.topLine}
                          </div>
                          <div className="">
                            {typeof (props.title) !== 'string' && props.title.bottomLine}
                          </div>
                        </div>
                      </Dialog.Title>
                    ) :
                    <Dialog.Title
                      className={tw(
                        props.pure ? 'hidden' : '',
                        'text-center leading-6 font-medium text-xl',
                        'text-primary-txt dark:text-primary-txt-dk'
                      )}
                    >
                      {typeof (props.title) === 'string' && props.title}
                    </Dialog.Title>

                  }
                  <div className={tw(props.closeBtnNoPaddings ? '' : 'mt-2', props.pure && !props.closeBtnNoPaddings ? 'hidden' : '',)}>
                    {!props.noCancelBtn && <div className={`pt-4 pr-4 absolute right-0 top-0 ${props.closeBtnNoPaddings ? '' : 'hidden'}`}>
                      <button
                        type="button"
                        className="rounded-md focus:outline-none
                        text-primary-txt dark:text-primary-txt-dk"
                        onClick={props.onClose}
                      >
                        <span className="sr-only">Close</span>
                        {!props.hideX && <XIcon className="h-6 w-6" aria-hidden="true" />}
                      </button>
                    </div>}
                    {
                      !isNullOrEmpty(props.subtitle) &&
                            <p className="text-sm text-gray-500">
                              {props.subtitle}
                            </p>
                    }
                  </div>

                  {props.children}
                </div>
              }
            </div>
          </div>
        </div >
      </Dialog >
    )
    }
  </AnimatePresence >;
}
