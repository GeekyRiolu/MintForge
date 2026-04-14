import CustomTooltip from 'components/elements/CustomTooltip';
import useCopyClipboard from 'hooks/useCopyClipboard';

import { Link } from 'phosphor-react';
import {
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share';

type SharingProps = {
  title: string;
};

export default function SharingIcons({ title }: SharingProps) {
  const [copied, setCopied] = useCopyClipboard();
  return (
    <div className="absolute right-0 bottom-3.5 md:bottom-1 flex row">
      <FacebookShareButton quote={title} url={window.location.href}>
        <FacebookIcon
          bgStyle={{ fill: '#FBF9F9' }}
          iconFillColor="#727272"
          className="w-8 h-8 md:w-6 md:h-6 p-0 border border-share-icon rounded-full"
        />
      </FacebookShareButton>
      <TwitterShareButton className="mx-3 rounded-full" title={title} url={window.location.href}>
        <TwitterIcon
          bgStyle={{ fill: '#FBF9F9' }}
          iconFillColor="#727272"
          className="w-8 h-8 md:w-6 md:h-6 border border-share-icon  rounded-full"
        />
      </TwitterShareButton>

      <CustomTooltip
        orientation='top'
        tooltipComponent={copied ?
          <div
            className="py-1 text-white"
            style={{
              minWidth: '7rem',
            }}
          >
            <p>Copied!</p>
          </div>
          : null
        }
      >
        <button className="w-8 h-8 md:w-6 md:h-6 flex justify-center items-center border border-share-icon rounded-full bg-share-icon-bg">
          <Link
            onClick={() => {
              setCopied(window.location.href);
              navigator.clipboard.writeText(window.location.href);
            }}
            className="flex-shrink-0 aspect-square w-8 h-5 md:w-6 md:h-4"
            color="#727272"
          >
          </Link>
        </button>
      </CustomTooltip>
    </div>
  );
}
