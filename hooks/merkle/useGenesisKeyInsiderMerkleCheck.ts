import { Maybe } from 'graphql/generated/types';

import InsiderClaims from './insider_gk_claims.json';

export interface MerkleResult {
  index: number;
  amount: string; // BigNumber hex
  proof: string[]; // 2 elements
}

export function useGenesisKeyInsiderMerkleCheck(address: Maybe<string>): Maybe<MerkleResult> {
  const merkleClaims = InsiderClaims.claims;
  const merkleClaimsLowercased = Object.fromEntries(
    Object.entries(merkleClaims).map(([key, value]) => [key.toLowerCase(), value]),
  );

  type claimsType = typeof merkleClaimsLowercased;
  type validAddress = keyof claimsType;
  if (
    address &&
    Object.keys(merkleClaimsLowercased).includes(address.toLowerCase())
  ) {
    return merkleClaimsLowercased[address.toLowerCase() as validAddress];
  }
  return null;
}