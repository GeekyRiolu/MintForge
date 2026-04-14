
import { InputMaybe, Scalars } from 'graphql/generated/types';
import { getTypesenseInstantsearchAdapterRaw } from 'utils/typeSenseAdapters';

import { captureException, flush } from '@sentry/nextjs';
import { useCallback, useState } from 'react';

export type TypesenseSearchInput = {
  collection?: InputMaybe<Scalars['String']>;
  index?: InputMaybe<Scalars['String']>;
  q: Scalars['String'];
  query_by: Scalars['String'];
  //searchTerm: Scalars['String'] | Array<Scalars['String'] >;
  per_page: Scalars['Int'];
  page: Scalars['Int'];
  facet_by?: InputMaybe<Scalars['String']>;
  max_facet_values?: InputMaybe<Scalars['Int']>;
  filter_by?: InputMaybe<Scalars['String']>;
  sort_by?: InputMaybe<Scalars['String']>;
  exhaustive_search?: boolean
};
export type TypesenseMultiSearchInput = {
  searches: Array<TypesenseSearchInput>;
};

export interface FetchTypesenseSearchData {
  fetchTypesenseSearch: (input: TypesenseSearchInput) => Promise<any>;
  fetchTypesenseMultiSearch: (input: TypesenseMultiSearchInput) => Promise<any>;
  loading: boolean;
}

export function useFetchTypesenseSearch(): FetchTypesenseSearchData {
  const [loading, setLoading] = useState(false);
  const client = getTypesenseInstantsearchAdapterRaw;

  const fetchTypesenseSearch = useCallback(async (input: TypesenseSearchInput) => {
    setLoading(true);
    try {
      setLoading(true);
      const result = await client.collections(input.index)
        .documents()
        .search({
          'q'        : input.q.toString(),
          'query_by' : input.query_by,
          'per_page' : input.per_page,
          'page'     : input.page,
          'filter_by': input.filter_by,
          'facet_by' : input.facet_by,
          'sort_by'  : input.sort_by,
          'exhaustive_search': true,
        });
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      captureException(err);
      await flush(2000);
      return null;
    }
  }, [client]);

  const fetchTypesenseMultiSearch = useCallback(async (input: TypesenseMultiSearchInput) => {
    setLoading(true);
    try {
      setLoading(true);
      const result = await client.multiSearch.perform(input);
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      // todo: handle the error based on the error code.
      console.log(error);
      return null;
    }
  }, [client]);

  return {
    fetchTypesenseSearch,
    fetchTypesenseMultiSearch,
    loading: loading,
  };
}
