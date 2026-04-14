
import { isNullOrEmpty } from 'utils/format';

import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

const looksrareHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const action = req.query['action'];

  switch(action) {
  case 'getNonce':
    try {
      const address = req.query['address'];
      if (isNullOrEmpty(address)) {
        res.status(400).json({ message: 'listNFT: missing required param "order' });
        return;
      }
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Looks-Api-Key': process.env.LOOKSRARE_API_KEY,
        }
      };
      const result = await fetch(
        'https://api.looksrare.org/api/v1/orders/nonce?address=' + address,
        options
      ).then(res => res.json());
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({ message: 'Failed to get nonce', error: e });
    }
    break;
  case 'getOrders':
    try {
      const contract = req.query['contract'];
      if (isNullOrEmpty(contract)) {
        res.status(400).json({ message: 'getOrders: missing required param "contract"' });
        return;
      }
      const tokenId = req.query['tokenId'];
      if (isNullOrEmpty(tokenId)) {
        res.status(400).json({ message: 'getOrders: missing required param "tokenId"' });
        return;
      }
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Looks-Api-Key': process.env.LOOKSRARE_API_KEY,
        }
      };
      const url = new URL('https://api.looksrare.org/api/v1/orders/');
      url.searchParams.set('collection', contract as string);
      url.searchParams.set('tokenId', tokenId as string);
      url.searchParams.set('isOrderAsk', 'true');
      url.searchParams.set('status', '["VALID"]');
      url.searchParams.set('sort', 'PRICE_ASC');
      // todo: do we need any of the other filters provided by the API? e.g. endTime?
      // todo: paginate to get all the listings
      const result = await fetch(
        url.toString(),
        options
      ).then(res => res.json());
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({ message: 'Failed to get orders', error: e });
    }
    break;
  // use gQL endpoint instead
  case 'DEPRECATED_listNFT':
    try {
      const order = JSON.parse(req.query['order'] as string);
      if (isNullOrEmpty(order)) {
        res.status(400).json({ message: 'listNFT: missing required param "order' });
        return;
      }
      const options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Looks-Api-Key': process.env.LOOKSRARE_API_KEY,
        },
        body: JSON.stringify(order)
      };
      const result = await fetch(
        'https://api.looksrare.org/api/v1/orders',
        options
      ).then(res => res.json());
      res.status(200).json( result );
    } catch (e) {
      res.status(500).json({ message: 'Failed to list NFT on Looksrare', error: e });
    }
    break;
  default:
    res.status(400).json({ message: 'Invalid action' });
    return;
  }
};

export default withSentry(looksrareHandler);

export const config = {
  api: {
    externalResolver: true,
  },
};
