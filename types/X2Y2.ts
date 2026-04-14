import { SettleDetail, SettleShared, TokenStandard, X2Y2Order, X2Y2OrderItem } from '@x2y2-io/sdk/dist/types';
import { BigNumberish } from 'ethers';

export const X2Y2_EXCHANGE_CONTRACT = '0x74312363e45DCaBA76c59ec49a7Aa8A65a67EeD3';

export const data1155ParamType = 'tuple(address token, uint256 tokenId, uint256 amount)[]';
export const data721ParamType = 'tuple(address token, uint256 tokenId)[]';

export const DELEGATION_TYPE_INVALID = 0;
export const DELEGATION_TYPE_ERC721 = 1;
export const DELEGATION_TYPE_ERC1155 = 2;

export const INTENT_SELL = 1;
export const INTENT_AUCTION = 2;
export const INTENT_BUY = 3;

export type Network = 'mainnet' | 'goerli'

export const OP_COMPLETE_SELL_OFFER = 1; // COMPLETE_SELL_OFFER
export const OP_COMPLETE_BUY_OFFER = 2; // COMPLETE_BUY_OFFER
export const OP_CANCEL_OFFER = 3; // CANCEL_OFFER
export const OP_BID = 4; // BID
export const OP_COMPLETE_AUCTION = 5; // COMPLETE_AUCTION
export const OP_REFUND_AUCTION = 6; // REFUND_AUCTION
export const OP_REFUND_AUCTION_STUCK_ITEM = 7; // REFUND_AUCTION_STUCK_ITEM

export type NetworkMeta = {
  id: number
  rpcUrl: string
  marketContract: string
  erc721DelegateContract: string
  erc1155DelegateContract: string
  wethContract: string
  apiBaseURL: string
}

export type RunInput = {
  orders: X2Y2Order[]
  details: SettleDetail[]
  shared: SettleShared
  // signature
  r: string
  s: string
  v: number
}

const orderItemParamType = 'tuple(uint256 price, bytes data)';
export const orderParamType = `tuple(uint256 salt, address user, uint256 network, uint256 intent, uint256 delegateType, uint256 deadline, address currency, bytes dataMask, ${orderItemParamType}[] items, bytes32 r, bytes32 s, uint8 v, uint8 signVersion)`;
export const orderParamTypes = [
  'uint256',
  'address',
  'uint256',
  'uint256',
  'uint256',
  'uint256',
  'address',
  'bytes',
  'uint256',
  `${orderItemParamType}[]`,
];
export const cancelInputParamType = 'tuple(bytes32[] itemHashes, uint256 deadline, uint8 v, bytes32 r, bytes32 s)';
const feeParamType = 'tuple(uint256 percentage, address to)';
const settleDetailParamType = `tuple(uint8 op, uint256 orderIdx, uint256 itemIdx, uint256 price, bytes32 itemHash, address executionDelegate, bytes dataReplacement, uint256 bidIncentivePct, uint256 aucMinIncrementPct, uint256 aucIncDurationSecs, ${feeParamType}[] fees)`;
const settleSharedParamType = 'tuple(uint256 salt, uint256 deadline, uint256 amountToEth, uint256 amountToWeth, address user, bool canFail)';
export const runInputParamType = `tuple(${orderParamType}[] orders, ${settleDetailParamType}[] details, ${settleSharedParamType} shared, bytes32 r, bytes32 s, uint8 v)`;

export const X2Y2_ORDER_TYPE = {
  X2Y2Order: [
    { name: 'salt', type: 'uint256' },
    { name: 'user', type: 'address' },
    { name: 'network', type: 'uint256' },
    { name: 'intent', type: 'uint256' },
    { name: 'delegateType', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
    { name: 'currency', type: 'address' },
    { name: 'dataMask', type: 'bytes' },
    { name: 'items', type: 'X2Y2OrderItem[]' },
  ],
  X2Y2OrderItem: [
    { name: 'price', type: 'uint256' },
    { name: 'data', type: 'bytes' }
  ]
};

export type X2Y2_ORDER_COMPONENTS = {
  salt: BigNumberish;
  user: string;
  network: BigNumberish;
  intent: BigNumberish;
  delegateType: BigNumberish;
  deadline: BigNumberish;
  currency: string;
  dataMask: string;
  items: X2Y2OrderItem[];
};

export type Order = {
  item_hash: string
  maker: string
  type: string
  side: number
  status: string
  currency: string
  end_at: string
  created_at: string
  token: {
    contract: string
    token_id: number
    erc_type: TokenStandard
  }
  id: number
  price: string
  taker: string | null
}