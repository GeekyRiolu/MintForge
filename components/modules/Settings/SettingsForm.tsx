import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { isNullOrEmpty } from 'utils/format';
import { sameAddress } from 'utils/helpers';
import { tw } from 'utils/tw';

import { ethers } from 'ethers';
import { CheckCircle, GasPump, Info,Warning } from 'phosphor-react';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

type SettingsFormProps = {
  buttonText: string;
  inputVal: string
  changeHandler: (e) => void
  submitHandler: () => void
  isAssociatedOrPending?: boolean
};

export default function SettingsForm({ buttonText, inputVal, changeHandler, submitHandler, isAssociatedOrPending }: SettingsFormProps) {
  const [error, setError] = useState(false);
  const { address: currentAddress } = useAccount();
  const isSelf = sameAddress(currentAddress, inputVal);

  useEffect(() => {
    if(isAssociatedOrPending){
      setError(true);
    } else if(isSelf){
      setError(true);
    } else if(ethers.utils.isAddress(inputVal)){
      setError(false);
    } else {
      setError(true);
    }
  }, [inputVal, isAssociatedOrPending, error, isSelf]);

  const getContent = useCallback(() => {
    if(isNullOrEmpty(inputVal)){
      return null;
    }

    if(isSelf && error) {
      return (
        <>
          <p className='text-[#DD0F70] mt-1 text-xs font-noi-grotesk'>This is your current address</p>
          <Warning size={25} className='mr-3 rounded-full absolute box-border top-[31%] -translate-y-1/2 right-0' weight="fill" color='#DD0F70' />
        </>
      );}

    if(isAssociatedOrPending && error) {
      return (
        <>
          <p className='text-[#D8771F] mt-1 text-xs font-noi-grotesk'>Request exists on chain</p>
          <Info size={25} className='mr-3 rounded-full absolute box-border top-[31%] -translate-y-1/2 right-0' weight="fill" color='#D8771F' />
        </>
      );
    }

    if(error){
      return (
        <>
          <p className='text-[#DD0F70] mt-1 text-xs font-noi-grotesk'>Address is not valid</p>
          <Warning size={25} className='mr-3 rounded-full absolute box-border top-[31%] -translate-y-1/2 right-0' weight="fill" color='#DD0F70' />
        </>
      );
    }

    return (
      <>
        <p className='text-[#0E8344] mt-1 text-xs font-noi-grotesk'>Valid wallet address</p>
        <CheckCircle size={25} className='mr-3 rounded-full absolute box-border top-[31%] -translate-y-1/2 right-0' color='green' weight="fill" />
      </>
    );
  },[error, inputVal, isSelf, isAssociatedOrPending]);

  return (
    <div className='w-full'>
      <div className='relative mb-3'>
        <input value={inputVal} onChange={(e) => changeHandler(e.target.value)}
          className={tw('box-border shadow appearance-none border rounded-[10px] w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline  placeholder:font-mono placeholder:text-sm pr-10',
            inputVal === '' ? 'border-[#D5D5D5]' : error ? 'border-[#DD0F70] focus:ring-[#DD0F70] focus:ring-1 focus:border-[#DD0F70]' : 'border-[#0E8344] focus:ring-[#0E8344] focus:ring-1 focus:border-[#0E8344]',
          )}
          id="currentAddress" type="text" placeholder="0x0000...0000" />

        {getContent()}
      </div>

      <Button
        type={ButtonType.PRIMARY}
        size={ButtonSize.LARGE}
        label={buttonText}
        stretch
        disabled={error || inputVal === '' || isAssociatedOrPending}
        onClick={() => submitHandler()}
      />
      <div className='flex items-center font-noi-grotesk text-[#6F6F6F] justify-center mt-2 text-sm'>
        <GasPump size={20} weight="fill" />
        <p className='ml-1'>This action will require a <span className='border-dashed	border-b border-[#6F6F6F]'>gas fee.</span></p>
      </div>
    </div>
  );
}
