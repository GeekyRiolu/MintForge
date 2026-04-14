import { getBaseUrl } from './isEnv';

export async function getPaginatedPosts(
  skip: number,
  pageSize: number,
  preview: boolean
) {
  const url = new URL(getBaseUrl() + 'api/contentful');
  url.searchParams.set('skip', String(skip));
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set('preview', String(preview));

  const result = await fetch(url.toString())
    .then(res => {
      return res.statusText == 'OK' ? res.json() : { items: null, total: 0 };
    })
    .catch(() => {
      return { items: null, total: 0 };
    });
  return result;
}
