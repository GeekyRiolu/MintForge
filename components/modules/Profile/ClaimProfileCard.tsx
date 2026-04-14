import { Button, ButtonSize, ButtonType } from 'components/elements/Button';

import Link from 'next/link';
import ClaimProfileIcon from 'public/icons/claim_profile_icon.svg?svgr';

export function ClaimProfileCard() {
  return (
    <div className="w-full h-full border-black border-[1.5px] rounded-[20px] py-6 minlg:px-5 text-center font-noi-grotesk">
      <div className='flex justify-center mb-4 minlg:mb-10'>
        <div className='h-6 w-14 minlg:h-[60px] minlg:w-[90px]'>
          <ClaimProfileIcon />
        </div>
      </div>

      <h3 className="mb-[10px] minlg:mb-6 font-semibold minlg:font-medium text-lg minlg:text-[27px]">Claim another profile</h3>
      <p className="mb-4 minlg:mb-10 text-[#6A6A6A]">You’re now a part of millions of creators, collectors, and curators.</p>
      <Link href={'/app/mint-profiles'}>
        <Button
          onClick={() => null}
          label='mint another profile'
          type={ButtonType.PRIMARY}
          size={ButtonSize.LARGE}
        />
      </Link>
    </div>
  );
}
