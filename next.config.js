const path = require('path');
const withTM = require('next-transpile-modules')([
  'react-dnd',
  'dnd-core',
  '@react-dnd/invariant',
  '@react-dnd/asap',
  '@react-dnd/shallowequal',
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, { dev: isDev, isServer }) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      resourceQuery: /svgr/,
      use: ['@svgr/webpack'],
    });

    config.module.rules.push({
      test: /\.svg$/i,
      loader: 'next-image-loader',
      issuer: { not: /\.(css|scss|sass)$/ },
      dependency: { not: ['url'] },
      resourceQuery: { not: [/svgr/] },
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
    ].map(i => {
      try {
        config.resolve.alias[i] = path.resolve(__dirname, 'node_modules', i);
      } catch (e) {}
    });

    return config;
  },
  images: {
    domains: [
      'cdn.nft.com',
      'nft-llc.mypinata.cloud',
      'cdn.nft.com/_ipx',
      'metadata.ens.domains',
      'images.ctfassets.net',
      'www.nft.com',
      'nftcom-dev-assets.s3.amazonaws.com',
      'img.cryptokitties.co'
    ],
  },
};

const moduleExports = withTM(nextConfig);

module.exports = moduleExports;
