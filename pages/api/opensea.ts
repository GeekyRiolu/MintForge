
import { isNullOrEmpty } from 'utils/format';

import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

const openseaHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const action = req.query['action'];

  switch(action) {
  case 'getCollection':
    try {
      const contract = req.query['contract'];
      if (isNullOrEmpty(contract)) {
        res.status(400).json({ message: 'getCollection: missing contract' });
        return;
      }
      const options = {
        method: 'GET',
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY
        },
      };
      const result = await fetch(
        'https://api.opensea.io/api/v1/asset_contract/' + contract,
        options
      ).then(res => res.json());
      res.status(200).json( result );
    } catch (e) {
      res.status(500).json({ message: 'Failed to get contract', error: e });
    }
    break;
  default:
    res.status(400).json({ message: 'Invalid action' });
    return;
  }
};

export default withSentry(openseaHandler);

export const config = {
  api: {
    externalResolver: true,
  },
};
