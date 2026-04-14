import { DefaultSeoProps } from 'next-seo';

const config: DefaultSeoProps = {
  openGraph: {
    type: 'website',
    locale: 'en',
    url: 'https://nft.com/',
    siteName: 'NFT.com',
  },
  twitter: {
    handle: '@NFTcomofficial',
    site: '@NFTcomofficial',
    cardType: 'summary_large_image',
  },
};

export default config;
