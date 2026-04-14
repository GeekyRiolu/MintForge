import { useCallback, useState } from 'react';

export interface Paginator {
  currentPage: number;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  afterCursor: string | null;
  beforeCursor: string | null;
  cachedTotalCount: number;
  setTotalCount: (totalCount: number) => void;
  nextPage: (cursor: string) => void;
  previousPage: (cursor: string) => void;
  resetPage: () => void;
}

/**
 * Wrapper hook containing all the state you need for a paginated query.
 */
export function usePaginator(initialPageSize: number): Paginator {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [cachedTotalCount, setCachedTotalCount] = useState(1);

  const setTotalCount = useCallback(
    (totalCount: number) => {
      if (totalCount != null && totalCount !== 0) {
        setCachedTotalCount(totalCount);
      }
    },
    []
  );

  const nextPage = useCallback(
    (cursor: string) => {
      if (currentPage < Math.ceil(cachedTotalCount / pageSize)) {
        setCurrentPage(currentPage + 1);
        setBeforeCursor(null);
        setAfterCursor(cursor);
      }
    },
    [cachedTotalCount, currentPage, pageSize]
  );

  const previousPage = useCallback(
    (cursor: string) => {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
        setAfterCursor(null);
        setBeforeCursor(cursor);
      }
    },
    [currentPage]
  );

  const resetPage = useCallback(() => {
    setAfterCursor(null);
    setBeforeCursor(null);
    setCurrentPage(0);
  }, []);

  // TODO (eddie): return a ready-to-use PageInput here?
  return {
    currentPage,
    pageSize,
    setPageSize,
    afterCursor,
    beforeCursor,
    cachedTotalCount,
    setTotalCount,
    nextPage,
    previousPage,
    resetPage,
  };
}
