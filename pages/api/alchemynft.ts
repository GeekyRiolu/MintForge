import { isNullOrEmpty } from 'utils/format';

import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export const ALCHEMY_KEYS = {
  '1': process.env.ALCHEMY_MAINNET_KEY,
  '5': '1Q6b1EbpBwWKyY3F0fblI6yQnDBMLlL0',
};

export const ALCHEMY_PREFIXES = {
  '1': 'mainnet',
  '5': 'goerli',
};

const alchemyNftHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Cache-Control', 's-maxage=10'); // 10 seconds cache
  const action = req.query['action'];
  let chainId = req.query['chainId'];
  if (isNullOrEmpty(chainId) || Number.isNaN(Number(chainId)) || !(String(chainId) in ALCHEMY_KEYS)) {
    chainId = '1';
  }

  const alchemyAPIKey = ALCHEMY_KEYS[chainId as string];

  const apiUrl = `https://eth-${ALCHEMY_PREFIXES[chainId as string]}.alchemyapi.io/nft/v2/${alchemyAPIKey}`;
  const nftApiUrl = `https://eth-${ALCHEMY_PREFIXES[chainId as string]}.alchemyapi.io/nft/v2/${alchemyAPIKey}`;

  switch (action) {
  case 'getNftMetadata': {
    const contractAddress = req.query['contractAddress'];
    const tokenId = req.query['tokenId'];
    const tokenType = req.query['tokenType'];

    if (
      isNullOrEmpty(contractAddress) ||
        isNullOrEmpty(tokenId) ||
        isNullOrEmpty(tokenType) ||
        !(tokenType === 'erc721' || tokenType === 'erc1155')
    ) {
      res.status(400).json({ message: 'getNftMetadata: Invalid Arguments' });
      return;
    }

    const requestUrl = new URL(apiUrl + '/getNFTMetadata/');
    requestUrl.searchParams.set('contractAddress', contractAddress as string);
    requestUrl.searchParams.set('tokenId', tokenId as string);
    requestUrl.searchParams.set('tokenType', tokenType as string);
    try {
      const result = await fetch(requestUrl.toString(), {
        method: 'GET',
        redirect: 'follow',
      }).then(alchemyRes => alchemyRes.json());
      res.status(200).json( result );
      return;
    } catch (e) {
      res.status(500).json(JSON.stringify({ message: 'getNfts: error processing Alchemy result' }));
      return;
    }
  }
  case 'getNfts': {
    const owner = req.query['owner'];
    const contractAddress = req.query['contractAddress'];
    const pageKey = req.query['pageKey'];
    if (isNullOrEmpty(contractAddress) || isNullOrEmpty(owner)) {
      res.status(400).json(JSON.stringify({ message: 'getNfts: Invalid Arguments' }));
      return;
    }

    const requestUrl = new URL(apiUrl + '/getNFTs/');
    requestUrl.searchParams.append('contractAddresses[]', contractAddress as string);
    requestUrl.searchParams.set('owner', owner as string);
    if (!isNullOrEmpty(pageKey as string) && pageKey !== 'null') {
      requestUrl.searchParams.set('pageKey', pageKey as string);
    }
    try {
      const result = await fetch(requestUrl.toString(), {
        method: 'GET',
        redirect: 'follow',
      }).then(alchemyRes => alchemyRes.json());
      res.status(200).json(result);
      return;
    } catch (e) {
      res.status(500).json(JSON.stringify({ message: 'getNfts: error processing Alchemy result', e }));
      return;
    }
  }
  case 'getContractMetadata': {
    const contractAddress = req.query['contractAddress'];
    if (isNullOrEmpty(contractAddress)) {
      res.status(400).json(JSON.stringify({ message: 'getContractMetadata: Invalid Arguments' }));
      return;
    }

    const requestUrl = new URL(apiUrl + '/getContractMetadata/');
    requestUrl.searchParams.append('contractAddress', contractAddress as string);
    try {
      const result = await fetch(requestUrl.toString(), {
        method: 'GET',
        redirect: 'follow',
      }).then(alchemyRes => alchemyRes.json());
      res.status(200).json(result);
      return;
    } catch (e) {
      res.status(500).json(JSON.stringify({ message: 'getContractMetadata: error processing Alchemy result', e }));
      return;
    }
  }
  case 'getNFTsForCollection': {
    const contractAddress = req.query['contractAddress'];
    const limit = req.query['limit'];
    if (isNullOrEmpty(contractAddress)) {
      res.status(400).json(JSON.stringify({ message: 'getNfts: Invalid Arguments' }));
      return;
    }
    const requestUrl = new URL(apiUrl + '/getNFTsForCollection/');
    requestUrl.searchParams.set('contractAddress', contractAddress as string);
    requestUrl.searchParams.set('withMetadata', 'true');
    if (!isNullOrEmpty(limit)) {
      requestUrl.searchParams.set('limit', limit as string);
    }
    try {
      const result = await fetch(requestUrl.toString(), {
        method: 'GET',
        redirect: 'follow',
      }).then(alchemyRes => alchemyRes.json());
      res.status(200).json(result);
      return;
    } catch (e) {
      res.status(500).json(JSON.stringify({ message: 'getNFTsForCollection: error processing Alchemy result', e }));
      return;
    }
  }
  case 'getFloorPrice': {
    const contractAddress = req.query['contractAddress'];
    if (isNullOrEmpty(contractAddress)) {
      res.status(400).json(JSON.stringify({ message: 'getFloorPrice: Invalid Arguments' }));
      return;
    }
    const requestUrl = new URL(nftApiUrl + '/getFloorPrice/');
    requestUrl.searchParams.set('contractAddress', contractAddress as string);
    try {
      const result = await fetch(requestUrl.toString(), {
        method: 'GET',
        redirect: 'follow',
      }).then(alchemyRes => alchemyRes.json());
      res.status(200).json(result);
      return;
    } catch (e) {
      res.status(500).json(JSON.stringify({ message: 'getFloorPrice: error processing Alchemy result', e }));
      return;
    }
  }
  default:
    res.status(400).json(JSON.stringify({ message: 'Action not recognized' }));
    return;
  }
};

export default withSentry(alchemyNftHandler);

export const config = {
  api: {
    externalResolver: true,
  },
};
