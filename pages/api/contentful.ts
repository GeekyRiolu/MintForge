import { withSentry } from '@sentry/nextjs';
import { POST_LIST_GRAPHQL_FIELDS } from 'lib/contentful/schemas';
import type { NextApiRequest, NextApiResponse } from 'next';

const contentfulPaginationHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Cache-Control', 's-maxage=600'); // 10 min cache
  const skip = req.query['skip'];
  const pageSize = req.query['pageSize'];
  const preview = req.query['preview'];
  const contentfulAPIKey = preview === 'true'
    ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
    : process.env.CONTENTFUL_ACCESS_TOKEN;
  const apiUrl = `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}?access_token=${contentfulAPIKey}`;

  const query = `
    {
      blogPostCollection(preview: ${preview}, limit: ${pageSize}, skip: ${skip}, order: publishDate_DESC) {
        total
        items {
          ${POST_LIST_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  try {
    const result = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    ).then((response) => response.json());

    const paginatedPosts = result.data.blogPostCollection
      ? result.data.blogPostCollection
      : { total: 0, items: [] };

    res.status(200).json( paginatedPosts );
    return;
  } catch(e) {
    res.status(500).json(JSON.stringify({ message: 'contentfulPagination: error processing Contentful result' }));
    return;
  }
};

export default withSentry(contentfulPaginationHandler);

export const config = {
  api: {
    externalResolver: true,
  },
};