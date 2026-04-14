import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { useMeQuery } from 'graphql/hooks/useMeQuery';
import { useUpdateMeMutation } from 'graphql/hooks/useUpdateMeMutation';
import { useEmailCaptureModal } from 'hooks/state/useEmailCaptureModal';
import { isNullOrEmpty } from 'utils/format';
import { tw } from 'utils/tw';

import { Dialog, Transition } from '@headlessui/react';
import { X } from 'phosphor-react';
import { Fragment, useState } from 'react';

export default function EmailCaptureModal() {
  const { updateMe } = useUpdateMeMutation();
  const { mutate: mutateMeInfo } = useMeQuery();
  const { emailCaptureModal, setEmailCaptureModalOpen } = useEmailCaptureModal();
  const [isChecked, setIsChecked] = useState(false);
  const [emailValue, setEmailValue] = useState(null);

  const closeModal = () => {
    setEmailValue(null);
    setEmailCaptureModalOpen(false);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const result = await updateMe({ email: emailValue });

    if (result) {
      mutateMeInfo();
      closeModal();
    }
  };

  return (
    <Transition appear show={emailCaptureModal} as={Fragment}>
      <Dialog as="div" className="relative z-[105]" onClose={() => closeModal()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={tw(
                'w-full relative max-w-[424px] transform overflow-hidden rounded-[20px] bg-white text-left align-middle shadow-xl transition-all',
                'px-4 minmd:px-12 pt-8 pb-7'
              )}>
                <X
                  onClick={() => closeModal()}
                  className='z-10 absolute top-5 right-5 hover:cursor-pointer'
                  size={20}
                  color="#8C939A"
                  weight="fill"
                />

                <div className='text-center font-noi-grotesk'>
                  <h3 className='text-[32px] mb-5 font-medium'>Stay tuned!</h3>

                  <p className='px-4 mb-7'>Enter your email address to receive updates & notifications</p>
                  <form onSubmit={(e) => submitHandler(e)}>
                    <input
                      className={tw(
                        'text-lg max-w-[328px] mb-5',
                        'text-left px-3 py-3 w-full rounded-lg',
                        'bg-[#F8F8F8] border-0',
                        'focus:ring-2 focus:ring-[#F9D54C]'
                      )}
                      placeholder="Enter your email"
                      autoFocus={true}
                      spellCheck={false}
                      type='email'
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                    />
                    <div className='flex'>
                      <input
                        checked={isChecked}
                        onClick={() => setIsChecked(!isChecked)}
                        type='checkbox'
                        className='mr-2 mt-1 max-w-[328px] text-black rounded-[4px] focus:ring-1 focus:ring-[#F9D54C]'
                      />
                      <p className='text-left mb-8 text-[#8F8F8F]'>
                        I have read and accept the <a target="_blank" href="https://cdn.nft.com/nft_com_terms_of_service.pdf" rel="noopener noreferrer" className='text-[#4B4B4B] font-semibold'>Terms & Conditions</a>
                      </p>
                    </div>

                    <Button
                      type={ButtonType.PRIMARY}
                      size={ButtonSize.LARGE}
                      label='Sign up'
                      stretch
                      disabled={!isChecked || isNullOrEmpty(emailValue) || emailValue === ''}
                      onClick={() => null}
                    />
                  </form>

                  <p onClick={() => closeModal()} className='mt-5 text-[#6A6A6A] hover:cursor-pointer'>Skip</p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
