/* eslint-disable @typescript-eslint/no-empty-function */
// pages/server-sitemap-index.xml/index.tsx
import { getSitemapUrl, teamAuthToken } from 'lib/sitemap';
import { GetServerSideProps } from 'next';
import { getServerSideSitemapIndexLegacy } from 'next-sitemap';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Setup variables
  const sitemapApi = getSitemapUrl({
    host: ctx.req.headers.host,
    path: `/api/sitemaps/server-sitemap-index?teamKey=${teamAuthToken}`
  });

  const { sitemapUrls } = await fetch(sitemapApi).then(res => res.json());

  return getServerSideSitemapIndexLegacy(ctx, sitemapUrls || []);
};

// Default export to prevent next.js errors
export default function SitemapIndex() { }
