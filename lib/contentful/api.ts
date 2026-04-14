import { POST_GRAPHQL_FIELDS, POST_LIST_GRAPHQL_FIELDS } from './schemas';

async function fetchGraphQL(query, preview = false) {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${preview
          ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
          : process.env.CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
    }
  ).then((response) => {
    return response.json();
  }).catch(() => { return {}; });
}

function extractPost(fetchResponse) {
  return fetchResponse?.data?.blogPostCollection?.items?.[0];
}

function extractPostEntries(fetchResponse) {
  return fetchResponse?.data?.blogPostCollection?.items;
}

export async function getPreviewPostBySlug(slug) {
  const entry = await fetchGraphQL(
    `query {
      blogPostCollection(where: { slug: "${slug}" }, preview: true, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    true
  );
  return extractPost(entry);
}

export async function getAllPostsWithSlug() {
  const entries = await fetchGraphQL(
    `query {
      blogPostCollection(where: { slug_exists: true }, order: publishDate_DESC) {
        items {
          ${POST_LIST_GRAPHQL_FIELDS}
        }
      }
    }`
  );
  return extractPostEntries(entries);
}

export async function getAllPostSlugs() {
  const entries = await fetchGraphQL(
    `query {
      blogPostCollection(where: { slug_exists: true }, order: publishDate_DESC) {
        items {
          slug
          publishDate
        }
      }
    }`
  );
  return extractPostEntries(entries);
}

export async function getAllPosts(preview) {
  const entries = await fetchGraphQL(
    `query {
      blogPostCollection(order: publishDate_DESC, preview: false) {
        items {
          ${POST_LIST_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview
  );
  return extractPostEntries(entries);
}

export async function getPost(slug, preview) {
  const entry = await fetchGraphQL(
    `query {
      blogPostCollection(where: { slug: "${slug}" }, preview: ${
  preview ? 'true' : 'false'
}, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview
  );
  return {
    post: extractPost(entry),
  };
}

export async function getItemById(id, preview, type, schema) {
  const entry = await fetchGraphQL(
    `query {
      ${type}(id: "${id}", preview: false) {
        ${schema}
      }
    }`,
    preview
  );
  return entry.data[type];
}

export async function getCollection(preview, limit, type, schema) {
  const entries = await fetchGraphQL(
    `query {
      ${type}(preview: ${preview ? 'true' : 'false'}, limit: ${limit}) {
        items {
          ${schema}
        }
      }
    }`,
    preview
  );
  return entries.data ? entries.data[type].items : [];
}

export async function getCuratedCollections(preview = false) {
  const entry = await fetchGraphQL(
    `query {
      curatedCollectionsCollection(preview: false) {
        items {
          tabTitle
          contractAddresses
        }
      }
    }`,
    preview
  );
  return entry;
}
