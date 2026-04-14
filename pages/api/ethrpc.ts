import { Doppler, getEnvBool } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';

import { ALCHEMY_KEYS, ALCHEMY_PREFIXES } from './alchemynft';

import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

const ethRpcHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  let chainId = req.query['chainId'];
  if (isNullOrEmpty(chainId) || Number.isNaN(Number(chainId))) {
    chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  }

  const INFURA_PREFIXES = {
    '1': 'mainnet',
    '5': 'goerli',
  };

  // infura keys
  const keys = [
    '460ed70fa7394604a709b7dff23f1641',
    'e8e020e35e914f84a6943f4ccd742260',
    'cc4f8267b2cb45e1bdb62b3402bb10d8',
    'ff54943ff46d4447a007337a563ba4f4',
    'efbc7a0f65e446df9863df0d26725904',
    '4ef34880c9104a8484ddb78ca27d9251',
    '1f6de584f58a4413a1d06bdcec927948',
    '30d28dee07804beb9d9189b4f884047f',
    'd77fe432e8c5466ea05c12b92dc0abbc',
    'f4f2db57088149e6814a242642eae9ef',
    '710542729f894e218b3c54a43bff942b',
    '0d29153d2e294348a6d7ecb6a763d427',
    '7bbeea51b4404b07a42baa389399fea3',
    '5c8f2ca5a2164b6da4bf2727b8f7b172',
    '190689f3d18e429f9034156e608f333d',
    'aced7c4b23f64cd28b7cb964f9033af0',
  ];

  const infuraAPIKey = keys[Math.floor(Math.random() * keys.length)];
  const alchemyAPIKey = ALCHEMY_KEYS[chainId as string];

  const apiUrl = getEnvBool(Doppler.NEXT_PUBLIC_INFURA_ENABLED) ?
    `https://${INFURA_PREFIXES[chainId as string]}.infura.io/v3/${infuraAPIKey}` :
    `https://eth-${ALCHEMY_PREFIXES[chainId as string]}.alchemyapi.io/v2/${alchemyAPIKey}`;

  try {
    const result = await fetch(apiUrl, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify(req.body),
    }).then(res => res.json());
    res.status(200).json( result );
  } catch (e) {
    res.status(500).json({ message: 'ETH RPC: error' });
  }
};

export default withSentry(ethRpcHandler);

export const config = {
  api: {
    externalResolver: true,
  },
};
