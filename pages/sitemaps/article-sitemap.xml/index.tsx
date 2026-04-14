/* eslint-disable @typescript-eslint/no-empty-function */
import { getSitemapUrl, teamAuthToken } from 'lib/sitemap';
import { GetServerSideProps } from 'next';
import { getServerSideSitemapLegacy } from 'next-sitemap';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const sitemapApi = getSitemapUrl({
    host: ctx.req.headers.host,
    path: `/api/sitemaps/article?teamKey=${teamAuthToken}`
  });
  const { sitemapFields } = await fetch(sitemapApi).then((res) => res.json());

  return getServerSideSitemapLegacy(ctx, sitemapFields || []);
};

// Default export to prevent next.js errors
export default function ArticleSitemap() { }
