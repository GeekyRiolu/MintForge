export interface CollectionSearchResult {
  document: CollectionDocument;
  highlight: {};
  highlights: any[];
}

export interface CollectionDocument {
  bannerUrl: string;
  chain: string;
  contractAddr: string;
  contractName: string;
  description: string;
  floor: number;
  id: string;
  isCurated: boolean;
  isOfficial: boolean;
  issuance: number;
  logoUrl: string;
  nftType: string;
  sales: number;
  score: number;
  volume: number;
  actualNumberOfNFTs?: number;
}
