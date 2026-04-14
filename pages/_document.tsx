import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { ReactElement } from 'react';

class MyDocument extends Document {

  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  render(): ReactElement {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="57x57"
            href="/favicon/icons/apple-icon-57x57.webp"
          />
          <link
            rel="apple-touch-icon"
            sizes="60x60"
            href="/favicon/icons/apple-icon-60x60.webp"
          />
          <link
            rel="apple-touch-icon"
            sizes="72x72"
            href="/favicon/icons/apple-icon-72x72.webp"
          />
          <link
            rel="apple-touch-icon"
            sizes="76x76"
            href="/favicon/icons/apple-icon-76x76.webp"
          />
          <link
            rel="apple-touch-icon"
            sizes="114x114"
            href="/favicon/icons/apple-icon-114x114.webp"
          />
          <link
            rel="apple-touch-icon"
            sizes="120x120"
            href="/favicon/icons/apple-icon-120x120.webp"
          />
          <link
            rel="apple-touch-icon"
            sizes="144x144"
            href="/favicon/icons/apple-icon-144x144.webp"
          />
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href="/favicon/icons/apple-icon-152x152.webp"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicon/icons/apple-icon-180x180.webp"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/favicon/icons/android-icon-192x192.webp"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon/icons/favicon-32x32.webp"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="96x96"
            href="/favicon/icons/favicon-96x96.webp"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon/icons/favicon-16x16.webp"
          />
          <link
            rel="manifest"
            crossOrigin="use-credentials"
            href="/manifest.json"
          />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="msapplication-TileImage" content="/ms-icon-144x144.webp" />
          <meta name="theme-color" content="#0C0F17" />
          <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.webp" />
          <script
            data-partytown-config
            dangerouslySetInnerHTML={{
              __html: `
                partytown = {
                  lib: "/_next/static/~partytown/",
                  forward: [
                    "dataLayer.push",
                    "gtag",
                    "gtag.event",
                    "gtag.pageview",
                    "fbq",
                    "fbq.pageview",
                    "fbq.event",
                  ]
                };
              `,
            }}
          />
        </Head>
        <body>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <div id="root"></div>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }

}

export default MyDocument;
