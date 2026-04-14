const { withSentryConfig } = require('@sentry/nextjs');
const path = require('path');
const v8 = require('v8');
const withTM = require('next-transpile-modules')([
  'react-dnd',
  'dnd-core',
  '@react-dnd/invariant',
  '@react-dnd/asap',
  '@react-dnd/shallowequal',
]);
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const { manifestHeaders, securityHeaders } = require('./config/headers');

// Return current node stats
const totalHeapSize = v8.getHeapStatistics().total_available_size;
const totalHeapSizeInMB = (totalHeapSize / 1024 / 1024).toFixed(2);

console.log('V8 Total Heap Size', totalHeapSizeInMB, 'MB');
console.log('V8 Heap Size Stats: \n');
Object.entries(v8.getHeapStatistics()).forEach(([key, value]) => {
  console.log(`\t${key}: ${(value / 1024 / 1024).toFixed(2)} MB`);
});

const sentryWebpackPluginOptions = {
  silent: true,
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  swcMinify: true, // Enables SWC rust compiler for minification
  experimental: {
    forceSwcTransforms: true,
    nextScriptWorkers: true,
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  sentry: { hideSourceMaps: true },
  poweredByHeader: false, // Stops broadcasting stack in header req/resp
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/',
        headers: securityHeaders
      },
      {
        source: '/:path',
        headers: securityHeaders
      },
      {
        source: '/app/:path',
        headers: securityHeaders
      },
      {
        source: '/articles/:path',
        headers: securityHeaders
      },
      {
        source: '/manifest.json',
        headers: manifestHeaders
      },
      {
      // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      },
      {
        source: '/server-sitemap-index.xml',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      },
      { source: '/sitemaps/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ] }
    ];
  },
  async redirects() {
    return [
      {
        source: '/app/auctions',
        destination: '/app/collection/0x8fB5a7894AB461a59ACdfab8918335768e411414',
        permanent: true,
      },
      {
        source: '/app/sale',
        destination: '/app/collection/0x8fB5a7894AB461a59ACdfab8918335768e411414',
        permanent: true,
      },
      {
        source: '/app/gallery',
        destination: '/app/collection/official/nftcom-genesis-key',
        permanent: true,
      },
      {
        source: '/app/discover',
        destination: '/app/discover/collections',
        permanent: true,
      },
    ];
  },
  webpack(config, { dev: isDev, isServer }) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      resourceQuery: /svgr/, // only use svgr to load svg if path ends with *.svg?svgr
      use: ['@svgr/webpack'],
    });

    // Re-add default nextjs loader for svg
    config.module.rules.push({
      test: /\.svg$/i,
      loader: 'next-image-loader',
      issuer: { not: /\.(css|scss|sass)$/ },
      dependency: { not: ['url'] },
      resourceQuery: { not: [/svgr/] }, // Ignore this rule if the path ends with *.svg?svgr
      options: { isServer, isDev, basePath: '', assetPrefix: '' },
    });

    [
      'axios',
      'bn.js',
      'buffer',
      'clsx',
      'color-name',
      'eth-rpc-errors',
      'pify',
      'preact',
      'qrcode',
      'react-is',
      'tslib',
      'typesense'
    ].map(i => config.resolve.alias[i] = path.resolve(
      __dirname,
      'node_modules',
      i
    ));

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        pathname: `/${process.env.CONTENTFUL_SPACE_ID}/**`
      }
    ],
    domains: [
      'cdn.nft.com',
      'nft-llc.mypinata.cloud',
      'cdn.nft.com/_ipx',
      'metadata.ens.domains',
      'images.ctfassets.net',
      'www.nft.com',
      '5hi24d3w2gny6zrfhekqk6mv4e0cfois.lambda-url.us-east-1.on.aws', // image proxy layer 2
      'nftcom-dev-assets.s3.amazonaws.com',
      'img.cryptokitties.co'
    ],
  },
};

const moduleExports = withTM(nextConfig);

module.exports = withBundleAnalyzer(withSentryConfig(moduleExports, sentryWebpackPluginOptions));
