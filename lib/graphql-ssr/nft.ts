import { NftResponse } from 'graphql/hooks/useNFTQuery';
import { gql, request } from 'graphql-request';
import { Doppler, getEnv } from 'utils/env';

import { BigNumber } from 'ethers';
import { ParsedUrlQuery } from 'querystring';
import { unstable_serialize } from 'swr';

export const getNftPage = async (params: ParsedUrlQuery) => {
  const chainId = getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID);
  const { collection, tokenId } = params;
  const id = BigNumber.from(tokenId).toHexString();

  const query = gql`
    query Nft(
      $contract: Address!,
      $id: String!,
      $chainId: String,
      $listingsPageInput: PageInput,
      $listingsExpirationType: ActivityExpiration,
      $listingsOwner: Address
    ) {
      nft(contract: $contract, id: $id, chainId: $chainId) {
        id
        isOwnedByMe
        price
        contract
        tokenId
        memo
        type
        owner
        previewLink
        isGKMinted
        wallet {
          address
          chainId
          preferredProfile {
            url
            photoURL
          }
        }
        metadata {
          name
          imageURL
          description
          traits {
            type
            value
          }
        }
        listings(listingsPageInput: $listingsPageInput, listingsExpirationType:     $listingsExpirationType, listingsOwner: $listingsOwner) {
            totalItems
            pageInfo {
                firstCursor
                lastCursor
            }
            items {
                id
                chainId
                activityType
                activityTypeId
                timestamp
                walletAddress
                nftContract
                nftId
                status
                order {
                    chainId
                    exchange
                    orderHash
                    orderType
                    makerAddress
                    takerAddress
                    protocol
                    nonce
                    id
                    protocolData {
                        ... on LooksrareProtocolData {
                            isOrderAsk
                            signer
                            collectionAddress
                            price
                            tokenId
                            amount
                            strategy
                            currencyAddress
                            nonce
                            startTime
                            endTime
                            minPercentageToAsk
                            params
                            v
                            r
                            s
                        }
                        ... on NFTCOMProtocolData {
                          makeAsset {
                            standard {
                              assetClass
                              bytes
                              contractAddress
                              tokenId
                              allowAll
                            }
                            nftId
                            bytes
                            value
                            minimumBid
                          }
                          takeAsset {
                            standard {
                              assetClass
                              bytes
                              contractAddress
                              tokenId
                              allowAll
                            }
                            nftId
                            bytes
                            value
                            minimumBid
                          }
                          swapTransactionId
                          acceptedAt
                          rejectedAt
                          listingId
                          buyNowTaker
                          auctionType
                          orderSignature: signature {
                            v
                            r
                            s
                          }
                          salt
                          start
                          end
                        }
                        ... on X2Y2ProtocolData {
                          side
                          type
                          erc_type
                          status
                          maker
                          contract
                          price
                          X2Y2Amount: amount
                          tokenId
                          currencyAddress
                          id
                          created_at
                          updated_at
                          end_at
                          royalty_fee
                          is_collection_offer
                          is_bundle
                          is_private
                        }
                        ... on SeaportProtocolData {
                            signature
                            parameters {
                                offerer
                                offer {
                                    itemType
                                    token
                                    identifierOrCriteria
                                    startAmount
                                    endAmount
                                }
                                consideration {
                                    itemType
                                    token
                                    identifierOrCriteria
                                    startAmount
                                    endAmount
                                    recipient
                                }
                                startTime
                                endTime
                                orderType
                                zone
                                zoneHash
                                salt
                                conduitKey
                                totalOriginalConsiderationItems
                                counter
                            }
                        }
                    }
                }
                cancel {
                    id
                    exchange
                    foreignType
                    foreignKeyId
                    transactionHash
                    blockNumber
                }
                transaction {
                    id
                    chainId
                    transactionHash
                    blockNumber
                    nftContractAddress
                    nftContractTokenId
                    maker
                    taker
                    protocol
                    exchange
                    protocolData {
                    ... on TxLooksrareProtocolData {
                        isOrderAsk
                        signer
                        collectionAddress
                        price
                        tokenId
                        amount
                        strategy
                        currencyAddress
                        nonce
                        startTime
                        endTime
                        minPercentageToAsk
                        params
                        v
                        r
                        s
                    }
                    ... on TxX2Y2ProtocolData {
                        amount
                        currency
                        data
                        deadline
                        delegateType
                        intent
                        orderSalt
                        settleSalt
                    }
    ... on TxNFTCOMProtocolData {
                  makeAsset {
                    standard {
                      assetClass
                      bytes
                      contractAddress
                      tokenId
                      allowAll
                    }
                    nftId
                    bytes
                    value
                    minimumBid
                  }
                  takeAsset {
                    standard {
                      assetClass
                      bytes
                      contractAddress
                      tokenId
                      allowAll
                    }
                    nftId
                    bytes
                    value
                    minimumBid
                  }
                  swapTransactionId
                  acceptedAt
                  rejectedAt
                  listingId
                  buyNowTaker
                  auctionType
                  salt
                  start
                  end
                  private
                  listingOrderId
                  bidOrderId
                }
                    ... on TxSeaportProtocolData {
                        offer {
                        itemType
                        token
                        identifierOrCriteria
                        startAmount
                        endAmount
                        }
                        consideration {
                        itemType
                        token
                        identifierOrCriteria
                        startAmount
                        endAmount
                        recipient
                        }
                    }
                    }
                }
            }
        }
      }
    }
  `;

  const data: NftResponse = await request(
    getEnv(Doppler.NEXT_PUBLIC_GRAPHQL_URL),
    query,
    {
      chainId,
      contract: collection,
      id,
      network: 'ethereum',
    }
  ).then(data => data.nft ?? {});

  return {
    props: {
      fallback: {
        [unstable_serialize(['NftQuery', collection, tokenId, undefined])]: data
      }
    },
  };
};
