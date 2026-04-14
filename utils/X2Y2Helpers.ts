import { StagedPurchase } from 'components/modules/Checkout/NFTPurchaseContext';
import { nftAggregator } from 'constants/contracts';
import { X2y2_exchange } from 'constants/typechain/X2y2_exchange';
import { NftType, X2Y2ProtocolData } from 'graphql/generated/types';
import {
  AggregatorResponse,
  cancelInputParamType,
  data721ParamType,
  data1155ParamType,
  DELEGATION_TYPE_ERC721,
  DELEGATION_TYPE_ERC1155,
  INTENT_SELL,
  Network,
  NetworkMeta,
  OP_COMPLETE_SELL_OFFER,
  Order,
  orderParamType, orderParamTypes, RunInput, runInputParamType
} from 'types';

import { isNullOrEmpty } from './format';
import { getBaseUrl } from './isEnv';
import { libraryCall, X2Y2Lib } from './marketplaceHelpers';

import { OP_CANCEL_OFFER } from '@x2y2-io/sdk';
import { CancelInput, TokenPair, TokenStandard, X2Y2Order } from '@x2y2-io/sdk/dist/types';
import { BigNumber, ethers } from 'ethers';
export const getNetworkMeta = (network: Network): NetworkMeta => {
  switch (network) {
  case 'mainnet':
    return {
      id: 1,
      rpcUrl: 'https://rpc.ankr.com/eth',
      marketContract: '0x74312363e45DCaBA76c59ec49a7Aa8A65a67EeD3',
      erc721DelegateContract: '0xf849de01b080adc3a814fabe1e2087475cf2e354',
      erc1155DelegateContract: '0x024ac22acdb367a3ae52a3d94ac6649fdc1f0779',
      wethContract: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      apiBaseURL: 'https://api.x2y2.org',
    };
  case 'goerli':
    return {
      id: 5,
      rpcUrl: 'https://rpc.ankr.com/eth_goerli',
      marketContract: '0x1891ecd5f7b1e751151d857265d6e6d08ae8989e',
      erc721DelegateContract: '0x095be13d86000260852e4f92ea48dc333fa35249',
      erc1155DelegateContract: '0x675B92ed07184635dEA2EF6fB403875DfA09d74A',
      wethContract: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
      apiBaseURL: 'https://goerli-api.x2y2.org',
    };
  }
};

function encodeItemData(data: TokenPair[]): string {
  if (data[0]?.tokenStandard === 'erc1155') {
    return ethers.utils.defaultAbiCoder.encode([data1155ParamType], [data]);
  } else {
    return ethers.utils.defaultAbiCoder.encode([data721ParamType], [data]);
  }
}

function fixSignature<T extends { v: number }>(data: T) {
  // in geth its always 27/28, in ganache its 0/1. Change to 27/28 to prevent
  // signature malleability if version is 0/1
  // see https://github.com/ethereum/go-ethereum/blob/v1.8.23/internal/ethapi/api.go#L465
  if (data.v < 27) {
    data.v = data.v + 27;
  }
}

async function signOrder(
  signer: ethers.Signer,
  order: X2Y2Order
): Promise<void> {
  const orderData: string = ethers.utils.defaultAbiCoder.encode(
    orderParamTypes,
    [
      order.salt,
      order.user,
      order.network,
      order.intent,
      order.delegateType,
      order.deadline,
      order.currency,
      order.dataMask,
      order.items.length,
      order.items,
    ]
  );
  const orderHash = ethers.utils.keccak256(orderData);

  // signMessage
  try {
    const orderSig = await signer.signMessage(ethers.utils.arrayify(orderHash));
    order.r = `0x${orderSig.slice(2, 66)}`;
    order.s = `0x${orderSig.slice(66, 130)}`;
    order.v = parseInt(orderSig.slice(130, 132), 16);
    fixSignature(order);
  } catch (err) {
    return null;
  }
}

function randomSalt(): string {
  const randomHex = BigNumber.from(ethers.utils.randomBytes(16)).toHexString();
  return ethers.utils.hexZeroPad(randomHex, 64);
}

function makeSellOrder(
  network: Network,
  user: string,
  expirationTime: number,
  items: { price: string; data: string }[],
  tokenStandard: TokenStandard | undefined
) {
  if (expirationTime < Math.round(Date.now() / 1000) + 900) {
    throw new Error('The expiration time has to be 15 minutes later.');
  }
  const salt = randomSalt();
  return {
    salt,
    user,
    network: getNetworkMeta(network).id,
    intent: INTENT_SELL,
    delegateType:
      tokenStandard === 'erc1155'
        ? DELEGATION_TYPE_ERC1155
        : DELEGATION_TYPE_ERC721,
    deadline: expirationTime,
    currency: ethers.constants.AddressZero,
    dataMask: '0x',
    items,
    r: '',
    s: '',
    v: 0,
    signVersion: 1,
  };
}

export async function signOrderForX2Y2(
  signer: ethers.Signer,
  order: X2Y2Order
): Promise<void> {
  await signOrder(signer, order);
}

export function encodeOrder(order: X2Y2Order): string {
  return ethers.utils.defaultAbiCoder.encode([orderParamType], [order]);
}

export function decodeRunInput(data: string): RunInput {
  return ethers.utils.defaultAbiCoder.decode(
    [runInputParamType],
    data
  )[0] as RunInput;
}

async function fetchOrderSign(
  caller: string,
  op: number,
  orderId: number,
  currency: string,
  price: string,
  royalty: number | undefined,
  payback: number | undefined,
  tokenId: string
): Promise<RunInput | undefined> {
  try {
    const url = new URL(getBaseUrl() + 'api/x2y2');
    url.searchParams.set('action', 'fetchOrderSign');
    url.searchParams.set('caller', caller);
    url.searchParams.set('op', op.toString());
    url.searchParams.set('orderId', orderId.toString());
    url.searchParams.set('currency', currency);
    url.searchParams.set('price', price);
    !isNullOrEmpty(royalty?.toString()) && url.searchParams.set('royalty', royalty.toString());
    !isNullOrEmpty(payback?.toString()) && url.searchParams.set('payback', payback.toString());
    url.searchParams.set('tokenId', tokenId);

    const data = await fetch(url.toString()).then(res => res.json());
    const inputData = (data.data ?? []) as { order_id: number; input: string }[];
    const input = inputData.find(d => d.order_id === orderId);
    return input ? decodeRunInput(input.input) : undefined;
  } catch (err) {
    console.log('error while fetchOrderSign: ', err);
    return undefined;
  }
}

async function acceptOrder(
  network: Network,
  accountAddress: string,

  op: number,
  orderId: number,
  currency: string,
  price: string,
  royalty: number | undefined,
  payback: number | undefined,
  tokenId: string
) {
  const runInput: RunInput | undefined = await fetchOrderSign(
    accountAddress,
    op,
    orderId,
    currency,
    price,
    royalty,
    payback,
    tokenId
  );
  // check
  let value: BigNumber = ethers.constants.Zero;
  let valid = false;
  if (runInput && runInput.orders.length && runInput.details.length) {
    valid = true;
    runInput.details.forEach(detail => {
      const order = runInput.orders[(detail.orderIdx as BigNumber).toNumber()];
      const orderItem = order?.items[(detail.itemIdx as BigNumber).toNumber()];
      if (detail.op !== op || !orderItem) {
        valid = false;
      } else if (
        (!order.currency || order.currency === ethers.constants.AddressZero) &&
        op === OP_COMPLETE_SELL_OFFER
      ) {
        value = value.add(detail.price);
      }
    });
  }

  if (!valid || !runInput) throw new Error('Failed to sign order');

  return runInput;
}

export async function buyOrder(
  network: Network,
  accountAddress: string,
  order: Order
): Promise<RunInput | undefined> {
  if (
    !(order.id && order.price && order.token)
  ) {
    throw new Error('Invalid Order');
  }

  return await acceptOrder(
    network,
    accountAddress,
    OP_COMPLETE_SELL_OFFER,
    order.id,
    order.currency,
    order.price,
    undefined,
    undefined,
    ''
  );
}

export async function createX2Y2ParametersForNFTListing(
  network: Network,
  signer: ethers.Signer,
  tokenAddress: string,
  tokenId: string,
  tokenStandard: TokenStandard,
  price: string,
  expirationTime: number,
): Promise<X2Y2Order> {
  const accountAddress = await signer.getAddress();
  const data = encodeItemData([
    {
      token: tokenAddress,
      tokenId,
      amount: 1,
      tokenStandard: tokenStandard ?? 'erc721',
    },
  ]);
  const order: X2Y2Order = makeSellOrder(
    network,
    accountAddress,
    expirationTime,
    [{ price, data }],
    tokenStandard
  );

  await signOrderForX2Y2(signer, order);

  return order;
}

export const getX2Y2Hex = async (
  executorAddress: string,
  protocolData: X2Y2ProtocolData,
  ethValue: string,
  tokenStandard: TokenStandard,
  hash: string
): Promise<AggregatorResponse> => {
  try {
    const {
      contract,
      created_at,
      currencyAddress,
      end_at,
      id,
      maker,
      price,
      side,
      status,
      tokenId,
      type,
    } = protocolData;

    const order = {
      item_hash: hash,
      maker,
      type,
      side,
      status,
      currency: currencyAddress,
      end_at: end_at.toString(),
      created_at: created_at.toString(),
      token: {
        contract,
        token_id: Number(tokenId),
        erc_type: tokenStandard,
      },
      id,
      price,
      taker: executorAddress,
    };
    const failIfRevert = true;
    const runInput = await buyOrder('mainnet', nftAggregator.mainnet, order);

    const inputData = [runInput, ethValue, protocolData?.contract, protocolData?.tokenId, failIfRevert];

    const wholeHex = await X2Y2Lib.encodeFunctionData('_run', inputData);

    const genHex = libraryCall('_run(RunInput,uint256,address,uint256,bool)', wholeHex.slice(10));

    return {
      tradeData: genHex,
      value: BigNumber.from(ethValue),
      marketId: '2',
    };
  } catch (err) {
    throw `error in getX2Y2Hex: ${err}`;
  }
};

export function decodeCancelInput(input: string): CancelInput {
  return ethers.utils.defaultAbiCoder.decode(
    [cancelInputParamType],
    input
  )[0] as CancelInput;
}

async function getCancelInput(
  caller: string,
  op: number,
  orderId: number,
  signMessage: string,
  sign: string
): Promise<CancelInput> {
  const url = new URL(getBaseUrl() + 'api/x2y2');
  url.searchParams.set('action', 'fetchOrderCancel');
  url.searchParams.set('caller', caller);
  url.searchParams.set('op', op.toString());
  url.searchParams.set('orderId', orderId.toString());
  url.searchParams.set('signMessage', signMessage);
  url.searchParams.set('sign', sign);

  const cancelData = await fetch(url.toString()).then(res => res.json());

  return decodeCancelInput(cancelData.data.input);
}

export async function cancelX2Y2Listing(
  network: Network,
  signer: ethers.Signer,
  orderId: number,
  X2Y2Exchange: X2y2_exchange
) {
  const accountAddress = await signer.getAddress();

  const signMessage = ethers.utils.keccak256('0x');
  const sign = await signer.signMessage(ethers.utils.arrayify(signMessage));
  const input: CancelInput = await getCancelInput(
    accountAddress,
    OP_CANCEL_OFFER,
    orderId,
    signMessage,
    sign
  );

  const cancel = await X2Y2Exchange.cancel(input.itemHashes, input.deadline, input.v, input.r, input.s);
  return cancel;
}

export const X2Y2BuyNow = async (
  order: StagedPurchase,
  X2Y2Exchange: X2y2_exchange,
  executorAddress: string
): Promise<boolean> => {
  try {
    const {
      contract,
      created_at,
      currencyAddress,
      end_at,
      id,
      maker,
      price,
      side,
      status,
      tokenId,
      type,
    } = order.protocolData as X2Y2ProtocolData;

    const tokenStandard: TokenStandard = order.nft.type === NftType.Erc1155 ? 'erc1155' : 'erc721';
    const x2y2Order = {
      item_hash: order.orderHash,
      maker,
      type,
      side,
      status,
      currency: currencyAddress,
      end_at: end_at.toString(),
      created_at: created_at.toString(),
      token: {
        contract,
        token_id: Number(tokenId),
        erc_type: tokenStandard,
      },
      id,
      price,
      taker: executorAddress,
    };
    const runInput = await buyOrder('mainnet', executorAddress, x2y2Order);
    const tx = await X2Y2Exchange.run(
      runInput,
      {
        value: order?.price
      }
    );

    gtag('event', 'BuyNow', {
      ethereumAddress: executorAddress,
      protocol: order.protocol,
      contractAddress: order?.nft?.contract,
      tokenId: order?.nft?.tokenId,
      txHash: tx,
      orderHash: order.orderHash,
    });

    fetch(`${getBaseUrl('https://www.nft.com/')}api/message?text=Buy Now on ${order.protocol} by ${executorAddress} for ${order.nft?.contract} ${order.nft?.tokenId}: https://etherscan.io/tx/${tx.hash}`);

    if (tx) {
      return await tx.wait(1).then(() => true).catch(() => false);
    } else {
      return false;
    }
  } catch (err) {
    console.log(`error in X2Y2BuyNow: ${err}`);
    return false;
  }
};

export function getX2Y2AssetPageUrl(contractAddress: string, tokenId: string) {
  return `https://x2y2.io/eth/${contractAddress}/${tokenId}`;
}
