import { isNullOrEmpty } from 'utils/format';
import { tw } from 'utils/tw';

import { CheckCircle } from 'phosphor-react';
import { useState } from 'react';

interface OnboardingInputProps {
  item: {
    email: string;
    accepted: boolean;
  };
  index: number;
  onSubmit: (e, inputValue: string, index: number) => void;
  errorMessage?: string;
  success?: boolean;
}

export default function OnboardingInput({ onSubmit, item, index, errorMessage, success } : OnboardingInputProps) {
  const [inputValue, setInputValue] = useState('');

  return (
    <>
      <div className='flex justify-center items-center'>
        <p className='mr-2 text-[#B2B2B2]'>#{index + 1}</p>
        <form className='flex w-full items-center' onSubmit={(e) => onSubmit(e, inputValue, index)}>
          <input
            className={tw(
              'text-lg min-w-0 w-3/4',
              'text-left w-full rounded-xl font-medium',
              'bg-[#F8F8F8] mr-5 border-0'
            )}
            type='email'
            placeholder="Enter email"
            autoFocus={true}
            spellCheck={false}
            value={item?.email || inputValue}
            disabled={!isNullOrEmpty(item?.email)}
            onChange={(e) => setInputValue(e.target.value)}
          />

          {item?.accepted ?
            <CheckCircle size={32} color="green" />
            :
            <input
              type="submit"
              value={isNullOrEmpty(item?.email) ? 'Refer' : item?.accepted ? 'Accepted' :'Sent'}
              disabled={item && !isNullOrEmpty(item?.email) || isNullOrEmpty(item?.email) && inputValue === ''}
              className={tw(
                'inline-flex w-max justify-center items-center',
                'rounded-xl border border-transparent bg-[#F9D54C] hover:bg-[#EFC71E]',
                'font-medium text-black py-2 px-4',
                'focus:outline-none focus-visible:bg-[#E4BA18]',
                'disabled:bg-[#D5D5D5] disabled:text-[#7C7C7C]',
                isNullOrEmpty(item?.email) && 'hover:cursor-pointer disabled:hover:cursor-auto'
              )} />
          }
        </form>
      </div>
      {errorMessage && <p className='text-xs text-[#F02D21]'>{errorMessage}</p>}
      {success && <p className='text-xs text-[#2AAE47]'>Referral email was successfully sent!</p>}
    </>
  );
}
