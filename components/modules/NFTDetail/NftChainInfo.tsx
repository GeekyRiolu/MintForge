import Copy from 'components/elements/Copy';
import CustomTooltip from 'components/elements/CustomTooltip';
import { Nft } from 'graphql/generated/types';
import { shortenAddress } from 'utils/helpers';

import { BigNumber } from 'ethers';
import { useRouter } from 'next/router';
import { Info } from 'phosphor-react';
import { PartialDeep } from 'type-fest';

export interface NftChainInfoProps {
  nft: PartialDeep<Nft>
}

export const NftChainInfo = (props: NftChainInfoProps) => {
  const { nft } = props;
  const router = useRouter();

  return (
    <div className='flex flex-row w-full' id="NftChainInfoContainer">
      <div className="flex flex-col items-center bg-[#F6F6F6] rounded-[24px] font-[18px] text-[#6A6A6A] w-full py-5 md:py-4 md:px-6 px-10 space-y-2">
        <div className='flex flex-row w-full items-center font-noi-grotesk justify-between md:py-1 py-1.5'>
          <p className='flex flex-row w-1/2 font-base items-center text-base leading-6'>
            Contract
          </p>
          <span
            className='flex flex-row w-1/2 justify-end text-base leading-6 cursor-pointer'
            onClick={nft?.contract && (() => router.push(`/app/collection/${nft?.contract}/`))}
          >
            {shortenAddress(nft?.contract)}
          </span>
        </div>
        {//todo: add volume
        }
        <div className='flex flex-row w-full items-center font-noi-grotesk md:py-1 py-1.5 justify-between'>
          <p className='flex flex-row w-1/2 font-base items-center text-base leading-6 whitespace-nowrap'>
            Token ID
          </p>
          {nft?.tokenId && <span className='flex flex-row w-1/2 justify-end text-base leading-6'>
            {BigNumber.from(nft?.tokenId).toString().length > 11 ?
              (
                <p className='flex items-center relative'>
                  <CustomTooltip
                    orientation='right'
                    tooltipComponent={
                      <div
                        className="rounded-xl p-3 bg-modal-bg-dk text-white w-full"
                      >
                        <p>{BigNumber.from(nft?.tokenId).toString()}</p>
                      </div>
                    }>
                    <Info className='mr-3' />
                  </CustomTooltip>
                  <Copy toCopy={BigNumber.from(props.nft?.tokenId).toString()} after keepContent size={'18'}>
                    {BigNumber.from(nft?.tokenId).toString().slice(0, 10) + '...'}
                  </Copy>
                </p>
              )
              : (
                <Copy toCopy={BigNumber.from(props.nft?.tokenId).toString()} after keepContent size={'18'}>
                  {BigNumber.from(nft?.tokenId).toString()}
                </Copy>
              )}
          </span>}
        </div>
        <div className='flex flex-row w-full items-center font-noi-grotesk md:py-1 py-1.5 justify-between'>
          <p className='flex flex-row w-1/2 font-base items-center text-base leading-6 whitespace-nowrap'>
            Token Standard
          </p>
          <span className='flex flex-row w-1/2 justify-end text-base leading-6'>
            {nft?.type}
          </span>
        </div>
        <div className='flex flex-row w-full items-center font-noi-grotesk md:py-1 py-1.5 justify-between'>
          <p className='flex flex-row w-1/2 font-base items-center text-base leading-6 whitespace-nowrap'>
            Blockchain
          </p>
          <span className='flex flex-row w-1/2 justify-end text-base leading-6'>
            ETH
          </span>
        </div>
      </div>
    </div>
  );
};
