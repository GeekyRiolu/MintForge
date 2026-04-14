import { gql, GraphQLClient } from 'graphql-request';

export { siteUrl } from 'next-sitemap.config';
import { DeploymentEnv, isNotEnv } from 'utils/isEnv';

/**
 * Returns the URL of the sitemap for the given host and path.
 * @param {Object} options - An object containing the host and path of the sitemap.
 * @param {string} options.host - The host of the sitemap.
 * @param {string} [options.path] - The path of the sitemap.
 * @returns {string} The URL of the sitemap.
 */
export const getSitemapUrl = ({ host, path }: {
  host: string,
  path?: string
}) => `${isNotEnv(DeploymentEnv.DEBUG) ? 'https://' : 'http://'}${host}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Creates a new sitemap GraphQL client with the given URL and headers.
 * @param {string} process.env.NEXT_PUBLIC_GRAPHQL_URL - The URL of the GraphQL endpoint.
 * @param {object} options - An object containing options for the client.
 * @param {string} options.cache - The cache strategy to use for the client.
 * @param {object} options.headers - An object containing headers to be sent with each request.
 * @returns A new GraphQL client instance.
 */
export const client = new GraphQLClient(process.env.NEXT_PUBLIC_GRAPHQL_URL, {
  cache: 'default',
  headers: {
    'Connection': 'keep-alive',
    'Keep-Alive': 'timeout=120'
  }
});

export const teamAuthToken = process.env.TEAM_AUTH_TOKEN;

/**
 * A collection of GraphQL queries for generating sitemaps.
 * @returns An object containing various GraphQL queries.
 */
export const gqlQueries = {
  officialCollections: gql`
    query OfficialCollections($input: OfficialCollectionsInput!) {
      officialCollections(input: $input) {
        items {
          contract
          slug
          chainId
        }
        pageCount
        totalItems
      }
    }
  `,
  collectionBySlug: gql`
    query Collection($input: CollectionInput!) {
      collection(input: $input) {
        collection {
          contract
        }
      }
    }
  `,
  collectionNfts: gql`
    query OfficialCollectionNFTs($input: OfficialCollectionNFTsInput!) {
      officialCollectionNFTs(input: $input) {
        items {
          tokenId
          updatedAt
        }
        pageCount
        totalItems
      }
    }
  `
};
