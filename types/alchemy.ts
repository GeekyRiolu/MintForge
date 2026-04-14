export interface AlchemyOwnedNFT {
  contract: {
    address: string
  }
  id: {
    tokenId: string
  }
  tokenUri: {
    raw: string
    gateway: string
  }
  title: string
  metadata: any
  media: Array<any>
}

export interface AlchemyAlternateMedia {
  uri: string
}
export interface AlchemyAttribute {
  trait_type: string
  value: string
  display_type?: string
}

export interface AlchemyNFTMetaDataResponse {
  contract: {
    address: string
  }
  id: {
    tokenId: string
    tokenMetadata: {
      tokenType: string
    }
  }
  externalDomainViewUrl: string
  media: {
    uri: string
  }
  alternateMedia: AlchemyAlternateMedia[]
  metadata: {
    name: string
    description: string
    image: string
    attributes: AlchemyAttribute[]
  }
  timeLastUpdated: string
}