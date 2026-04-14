import { Doppler, getEnv, getEnvBool } from 'utils/env';

export enum SearchableFields {
  COLLECTIONS_INDEX_FIELDS = 'contractAddr,contractName,chain,nftType',
  NFTS_INDEX_FIELDS = 'nftName,nftType,tokenId,ownerAddr,chain,contractName,contractAddr,status,traits.value,traits.type',
  PROFILES_INDEX_FIELDS = 'url',
  NFTS_COLLECTION_FIELDS = 'contractName',
  FACET_NFTS_INDEX_FIELDS = 'nftType,chain,contractName,status,traits.value,traits.type',
  FACET_COLLECTIONS_INDEX_FIELDS = 'nftType,contractName'
}

export interface TypesenseSearchResponse {
  face_counts: any
  found: number
  hits: any
  request_params: {
    collection_name: string,
    per_page: number,
    q: string,
  }
  search_cutoff: boolean
  search_time_ms: number
}

const getTypeSenseServerData = () => ({
  apiKey: getEnv(Doppler.NEXT_PUBLIC_TYPESENSE_APIKEY) || 'placeholder',
  nodes: [
    {
      host: getEnv(Doppler.NEXT_PUBLIC_TYPESENSE_HOST) || 'localhost',
      port: 443,
      protocol: 'https' as const,
    },
  ],
  sendApiKeyAsQueryParam: false,
  cacheSearchResultsForSeconds: 2 * 60,
});

let _multiIndexAdapter: any = null;
export const getMultiIndexTypesenseInstantSearchAdapter = () => {
  if (!_multiIndexAdapter) {
    try {
      const TypesenseInstantSearchAdapter = require('typesense-instantsearch-adapter');
      _multiIndexAdapter = new TypesenseInstantSearchAdapter({
        server: getTypeSenseServerData(),
        additionalSearchParameters: {
          query_by: SearchableFields.NFTS_INDEX_FIELDS + (getEnvBool(Doppler.NEXT_PUBLIC_TYPESENSE_SETUP_ENABLED) ? ',listings.type,listings.currency,listings.marketplace' : 'marketplace,listingType,currency'),
        },
        collectionSpecificSearchParameters: {
          ntfs: {
            query_by: SearchableFields.NFTS_INDEX_FIELDS + (getEnvBool(Doppler.NEXT_PUBLIC_TYPESENSE_SETUP_ENABLED) ? ',listings.type,listings.currency,listings.marketplace' : 'marketplace,listingType,currency'),
          },
          collections: {
            query_by: SearchableFields.COLLECTIONS_INDEX_FIELDS,
          },
          profiles: {
            query_by: SearchableFields.PROFILES_INDEX_FIELDS,
          },
        },
      });
    } catch {
      _multiIndexAdapter = { searchClient: null };
    }
  }
  return _multiIndexAdapter;
};

// Keep backward compat as a lazy getter
export const MultiIndexTypesenseInstantSearchAdapter = new Proxy({} as any, {
  get(_, prop) {
    return getMultiIndexTypesenseInstantSearchAdapter()?.[prop];
  }
});

export const getTypesenseInstantsearchAdapter = (QUERY_BY: SearchableFields) => {
  try {
    const TypesenseInstantSearchAdapter = require('typesense-instantsearch-adapter');
    const adapter = new TypesenseInstantSearchAdapter({
      server: getTypeSenseServerData(),
      additionalSearchParameters: { query_by: QUERY_BY },
    });
    return adapter.searchClient;
  } catch {
    return null;
  }
};

export const getTypesenseInstantsearchAdapterRaw = new Proxy({} as any, {
  get(_, prop) {
    try {
      const Typesense = require('typesense');
      const client = new Typesense.Client({
        'nodes': [{
          'host': getEnv(Doppler.NEXT_PUBLIC_TYPESENSE_HOST) || 'localhost',
          'port': 443,
          'protocol': 'https',
        }],
        sendApiKeyAsQueryParam: false,
        'apiKey': getEnv(Doppler.NEXT_PUBLIC_TYPESENSE_APIKEY) || 'placeholder',
      });
      return client[prop];
    } catch {
      return undefined;
    }
  }
});
