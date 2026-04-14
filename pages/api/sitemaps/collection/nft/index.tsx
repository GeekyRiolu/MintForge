/* eslint-disable @typescript-eslint/no-empty-function */
import { SitemapField } from 'types';

import { BigNumber } from 'ethers';
import { client, getSitemapUrl, gqlQueries, teamAuthToken } from 'lib/sitemap';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Serverless API route for querying collection nfts sitemap data,
 * by the provided collection, chainId, and page.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 * @returns {{sitemapFields: SitemapField[]}} res - 200 response with array of sitemap fields
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chainId, collection, page: pageCtx, teamKey } = req.query;
  try {
    const page = parseInt(pageCtx as string);
    const sitemapFields: SitemapField[] = [];
    const siteUrlHost = getSitemapUrl({
      host: req.headers.host,
      path: '/app/nft'
    });

    // Verify api has proper auth token
    if (teamKey !== teamAuthToken) {
      return res.status(404).end();
    }

    client.setHeader('teamKey', teamKey);

    // Add collection name lookup
    const officialCollection = await client.request(gqlQueries.collectionBySlug, {
      input: {
        network: 'ethereum', // Update once we expand networks
        slug: collection
      }
    }).then(data => data?.collection?.collection);

    if (!officialCollection && !officialCollection.contract) {
      throw new Error('Collection Not Found');
    }

    const officialCollectionNfts = await client.request(
      gqlQueries.collectionNfts,
      {
        input: {
          chainId,
          collectionAddress: officialCollection?.contract,
          offsetPageInput: { page }
        }
      }).then(data => data.officialCollectionNFTs);

    if (officialCollectionNfts && officialCollectionNfts?.items) {
      officialCollectionNfts.items.forEach(({ tokenId, updatedAt }) => {
        sitemapFields.push({
          loc: `${siteUrlHost}/${officialCollection.contract}/${BigNumber.from(tokenId).toString()}`,
          lastmod: updatedAt,
          priority: 0.7,
          changefreq: 'daily'
        });
      });
    }

    // Cache API response for 23hrs 59min
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

    return res.status(200).json({ sitemapFields });
  } catch (err) {
    console.error(err?.message);
    return res.status(500).json({
      error: {
        message: `An error occurred fetching the following sitemap collection page of nfts, ${JSON.stringify({ chainId, collection, page: pageCtx, message: err?.message }, null, 2)}`
      }
    });
  }
}
