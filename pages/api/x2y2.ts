import { isNullOrEmpty } from 'utils/format';

import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

const x2y2Handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const action = req.query['action'];

  switch(action) {
  case 'fetchOrderSign':
    try {
      const caller = req.query['caller'];
      const op = Number(req.query['op']);
      const orderId = Number(req.query['orderId']);
      const currency = req.query['currency'];
      const price = req.query['price'];
      const royalty = req.query['royalty'];
      const payback = req.query['payback'];

      const headers = new Headers();
      headers.append('X-API-KEY', process.env.X2Y2_API_KEY);
      headers.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        'caller': caller,
        'op': op,
        'amountToEth': '0',
        'amountToWeth': '0',
        'items': [
          {
            'orderId': orderId,
            'currency': currency,
            'price': price,
            'tokenId': '',
            ...(!isNullOrEmpty(royalty) && { 'royalty': royalty }),
            ...(!isNullOrEmpty(payback) && { 'payback': payback })
          }
        ],
        'check': false
      });

      const requestOptions = {
        method: 'POST',
        headers: headers,
        body: raw
      };

      const result = await fetch('https://api.x2y2.org/api/orders/sign', requestOptions)
        .then(res => res.json());
      res.status(200).json( result );
    } catch (e) {
      res.status(500).json({ message: 'Failed to get order sign', error: e });
    }
    break;
  case 'fetchOrderCancel':
    try {
      const caller = req.query['caller'];
      const op = Number(req.query['op']);
      const orderId = Number(req.query['orderId']);
      const signMessage = req.query['signMessage'];
      const sign = req.query['sign'];

      const headers = new Headers();
      headers.append('X-API-KEY', process.env.X2Y2_API_KEY);
      headers.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        caller,
        op,
        items: [{ orderId }],
        sign_message: signMessage,
        sign
      });

      const requestOptions = {
        method: 'POST',
        headers: headers,
        body: raw
      };

      const result = await fetch('https://api.x2y2.org/api/orders/cancel', requestOptions)
        .then(res => res.json());
      res.status(200).json( result );
    } catch (e) {
      res.status(500).json({ message: 'Failed to get order sign', error: e });
    }
    break;
  default:
    res.status(400).json({ message: 'Invalid action' });
    return;
  }
};

export default withSentry(x2y2Handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
