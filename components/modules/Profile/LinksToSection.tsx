/* eslint-disable @next/next/no-img-element */
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { getAddress } from 'utils/httpHooks';

import Link from 'next/link';

export interface LinksToSectionParams {
  isAddressOwner: boolean;
}

export function LinksToSection(props: LinksToSectionParams) {
  const { isAddressOwner } = props;
  const defaultChainId = useDefaultChainId();
  const ownerlinksContents = [
    {
      image: '/link-to-nftcom.webp',
      section: 'DOCUMENT',
      title: 'NFT.COM Summary',
      description: 'Learn more about NFT.com at our docs page.',
      linkTo: 'https://docs.nft.com'
    },
    // {
    //   image: LinkToWhitePaper,
    //   section: 'COMING SOON',
    //   title: 'NFT.COM Whitepaper',
    //   description: 'Learn more about Genesis Keys and Profiles in this PDF.',
    //   linkTo: () => {
    //     // todo: whitepaper link
    //   }
    // },
    {
      image: '/link-to-you.webp',
      section: 'KNOWLEDGE BASE',
      title: 'NFT.COM Support',
      description: 'Learn about the different ways you can obtain your own NFT.com Profile.',
      linkTo: 'https://docs.nft.com'
    },
    {
      image: '/link-to-green-key.webp',
      section: 'GALLERY',
      title: 'NFT.COM Gallery',
      description: 'Explore all our Genesis Keys.',
      linkTo: '/app/collection/official/nftcom-genesis-key'
    },
    {
      image: '/link-to-nftcom-2.webp',
      section: 'MARKET PLACE',
      title: 'NFT.com',
      description: 'Start building your NFT collection by buying NFTs on the NFT.com Marketplace.',
      linkTo: 'https://www.nft.com/you'
    }
  ];

  const notOwnerlinksContents = [
    {
      image: '/link-to-key.webp',
      section: 'EVENTS',
      title: 'NFT.COM Beta',
      description: 'Get a Genesis Key to access the NFT.com Beta.',
      linkTo: `/app/collection/${getAddress('genesisKey', defaultChainId)}`
    },
    {
      image: '/link-to-you.webp',
      section: 'KNOWLEDGE BASE',
      title: 'NFT.COM Support',
      description: 'Learn about the different ways you can obtain your own NFT.com Profile.',
      linkTo: 'https://docs.nft.com'
    },
    {
      image: '/link-to-green-key.webp',
      section: 'GALLERY',
      title: 'NFT.COM Gallery',
      description: 'Explore all our Genesis Keys.',
      linkTo: '/app/collection/official/nftcom-genesis-key'
    },
    {
      image: '/link-to-nftcom-2.webp',
      section: 'MARKET PLACE',
      title: 'NFT.com',
      description: 'Start building your NFT collection by buying NFTs on the NFT.com Marketplace.',
      linkTo: 'https://www.nft.com/you'
    }
  ];

  return (
    <div className="flex flex-col minxl:flex-row space-y-4 minxl:space-y-0 space-x-0 minxl:space-x-4 w-auto minxl:w-full">
      {
        (isAddressOwner ? ownerlinksContents : notOwnerlinksContents)
          .map((item) =>
            (
              <Link href={item.linkTo}
                key={item.section}
                legacyBehavior
              >
                <a
                  target='_blank'
                  key={item.section}
                  className="bg-footer-bg rounded-xl lg:w-full w-52 grow cursor-pointer">
                  <div className="text-sm minxl:text-lg p-2 minlg:p-4">{item.section}</div>
                  <div className="w-full">
                    <img src={item.image} className="object-center object-cover w-full" alt="link to section" />
                  </div>
                  <div className="p-3 minlg:p-4">
                    <div className="mb-1 text-base minxl:text-xl">{item.title}</div>
                    <div className="text-xs minxl:text-base">{item.description}</div>
                  </div>
                </a>
              </Link>
            )
          )
      }
    </div>
  );
}
