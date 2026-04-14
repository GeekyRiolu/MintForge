/* eslint-disable @typescript-eslint/no-empty-function */
import { SitemapField } from 'types';

import { client, getSitemapUrl, gqlQueries, teamAuthToken } from 'lib/sitemap';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Serverless API route for querying collections sitemap data.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 * @returns {{sitemapFields: SitemapField[]}} res - 200 response with array of sitemap fields
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Setup variables
    const { teamKey } = req.query;
    const sitemapFields: SitemapField[] = [];
    const siteUrlHost = getSitemapUrl({
      host: req.headers.host,
      path: '/app/collection/official'
    });

    // Verify api has proper auth token
    if (teamKey !== teamAuthToken) {
      return res.status(404).end();
    }

    client.setHeader('teamKey', teamKey);

    const officialCollections = await client.request(
      gqlQueries.officialCollections,
      {
        input: {
          offsetPageInput: {
            page: 1
          }
        }
      }).then(data => data.officialCollections);

    if (officialCollections && officialCollections?.items) {
      officialCollections.items.forEach(({ slug, updatedAt }) => {
        sitemapFields.push({
          loc: `${siteUrlHost}/${slug}`,
          lastmod: updatedAt,
          priority: 0.7,
          changefreq: 'daily'
        });
      });
    }

    // Cache API response for 23hrs 59min
    res.setHeader('Cache-Control', 's-maxage=86340, stale-while-revalidate');

    return res.status(200).json({ sitemapFields });
  } catch (err) {
    console.error(err?.message);
    return res.status(500).json({
      error: {
        message: `An error occurred fetching the collections sitemap, ${err?.message}`
      }
    });
  }
}
