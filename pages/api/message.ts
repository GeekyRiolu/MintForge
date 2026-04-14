import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const INTERNAL_TESTING = [
  '0x9b3bA8B2a6E570067927B74dED7c62717Dc5cAB6',
  '0x0a383703969a6121A881b1a51CD421B72C881861'
];

const message = async (req: NextApiRequest, res: NextApiResponse) => {
  const url = 'https://slack.com/api/chat.postMessage';

  for (let i = 0; i < INTERNAL_TESTING.length; i++) {
    if ((req?.query?.text as string)?.toLowerCase().includes(INTERNAL_TESTING[i].toLowerCase())) {
      res.status(200).json('ok');
      return;
    }
  }
  
  try {
    // only in prod
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
      },
      body: JSON.stringify({
        channel: 'sub-nftdotcom-analytics',
        text: req.query.text,
        username: 'NFT.com Bot',
        pretty: 1,
        mrkdwn: true,
      }),
    });

    res.status(200).json('ok');
  } catch (err) {
    res.status(401).json('error');
  }
};

export default withSentry(message);

export const config = {
  api: {
    externalResolver: true,
    responseLimit: false,
  },
};