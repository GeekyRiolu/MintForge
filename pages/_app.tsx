import 'styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import 'styles/css/react-medium-image-zoom-styles.css';

import fonts from 'config/fonts.config';
import RootProvider from 'context';
import useAnalyticsOnRouteChange from 'hooks/useAnalyticsOnRouteChange';

import * as fbq from 'lib/fbq';
import * as gtag from 'lib/gtag';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { DefaultSeo } from 'next-seo';
import React, { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({
  Component,
  pageProps,
  router,
}: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  useAnalyticsOnRouteChange();

  return (
    <>
      <style jsx global>
        {`
          :root {
            --dm-mono-font: ${fonts.dmMono.style.fontFamily};
            --grotesk-font: ${fonts.grotesk.style.fontFamily};
            --noi-grotesk-font: ${fonts.noiGrotesk.style.fontFamily};
            --rubik-font: ${fonts.rubik.style.fontFamily};
          }
          `}
      </style>
      <Head>
        <title>NFT.com</title>
        <script
          type="text/partytown"
          nonce='pb+/pfhRedphzqIYzlBxMA=='
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            window.gtag = function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_TRACKING_ID}', {
                page_path: window.location.pathname,
            });
        `,
          }}
        />
      </Head>
      <Script
        strategy="worker"
        nonce="gGkqzVy6zqm4Aoyp9I4H5g=="
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        id="fb-pixel-script"
        nonce='375Pd+0smY3JyJkGZJLKnA=='
        strategy="worker"
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s) {
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments)
          :n.queue.push(arguments);};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s);
          }(window, document,'script', 'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', ${fbq.FB_PIXEL_ID});
          ` }} />
      <DefaultSeo
        title="NFT.com | The Social NFT Marketplace"
        description="Join NFT.com to display, trade, and engage with your NFTs."
        openGraph={{
          url: 'https://www.nft.com',
          title: 'NFT.com | The Social NFT Marketplace',
          description:
            'Join NFT.com to display, trade, and engage with your NFTs.',
          site_name: 'NFT.com',
          images: [
            {
              url: 'https://www.nft.com/site-meta-image.webp',
              width: 1200,
              height: 627,
              alt: 'NFT.com | The Social NFT Marketplace',
              type: 'image/png',
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
        }}
      />
      <RootProvider>
        {getLayout(
          <Component {...pageProps} key={router.pathname} />
        )}
      </RootProvider>

    </>
  );
}
