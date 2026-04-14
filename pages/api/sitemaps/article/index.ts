/* eslint-disable @typescript-eslint/no-empty-function */
import { SitemapField } from 'types';

import { getAllPostSlugs } from 'lib/contentful/api';
import { getSitemapUrl, teamAuthToken } from 'lib/sitemap';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamKey } = req.query;
  try {
    const sitemapFields: SitemapField[] = [];
    const siteUrlHost = getSitemapUrl({
      host: req.headers.host,
      path: '/articles'
    });

    // Verify api has proper auth token
    if (teamKey !== teamAuthToken) {
      return res.status(404).end();
    }

    const articles = await getAllPostSlugs();

    if (!articles) {
      throw new Error('Articles Not Found');
    }

    if (articles) {
      articles.forEach((article) => {
        sitemapFields.push({
          loc: `${siteUrlHost}/${article?.slug}`,
          lastmod: article?.publishDate,
          priority: 0.7,
          changefreq: 'hourly'
        });
      });
    }

    // Cache API response for 59min
    res.setHeader('Cache-Control', 's-maxage=3540, stale-while-revalidate');

    return res.status(200).json({ sitemapFields });
  } catch (err) {
    console.error(err?.message);
    return res.status(500).json({
      error: {
        message: `An error occurred fetching the following article sitemap, ${JSON.stringify(err?.message, null, 2)}`
      }
    });
  }
}
