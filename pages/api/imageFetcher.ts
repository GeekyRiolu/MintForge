import { wrapApiHandlerWithSentry } from '@sentry/nextjs';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const imageFetcher = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Cache-Control', 's-maxage=600'); // 10 min cache

  const fallBackImage = 'https://cdn.nft.com/optimizedLoader2.webp';
  try {
    if (!req.query.url) throw new Error('no url provided');

    const r = await axios.get(`https://5hi24d3w2gny6zrfhekqk6mv4e0cfois.lambda-url.us-east-1.on.aws?url=${encodeURIComponent(`${req.query.url}`)}&width=${Number(req.query.width) || 1000}&height=${Number(req.query.height) || 1000}`);
    const optimizedUrl = r?.data?.data || fallBackImage;
    const result = await fetch(optimizedUrl);
    if (result.statusText == 'Unprocessable Entity' || !process.env.IMAGE_PROXY_ENABLED) {
      const originalResult = await fetch(decodeURIComponent(`${req.query.url}`));
      const originalBody = await originalResult.body;
      originalBody.pipe(res);
    } else {
      const body = await result.body;
      body.pipe(res);
    }
  } catch (err) {
    const originalResult = await fetch(fallBackImage);
    const originalBody = await originalResult.body;
    originalBody.pipe(res);
  }
};

export default wrapApiHandlerWithSentry(imageFetcher, '/api/imageFetcher');

export const config = {
  api: {
    externalResolver: true,
    responseLimit: false,
  },
};
