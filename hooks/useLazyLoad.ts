import { useCallback,useEffect, useReducer } from 'react';

const INTERSECTION_THRESHOLD = 5;

const reducer = (state: any, action: any) => {
  switch (action.type) {
  case 'set': {
    return {
      ...state,
      ...action.payload
    };
  }
  case 'onGrabData': {
    return {
      ...state,
      loading: false,
      data: [...state.data, ...action.payload.data],
      currentPage: state.currentPage + 1
    };
  }
  default:
    return state;
  }
};

const useLazyLoad = ({ triggerRef, onGrabData, options }: any) => {
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    currentPage: 1,
    data: [],
  });

  const _handleEntry = useCallback(async (entry: any) => {
    const boundingRect = entry.boundingClientRect;
    const intersectionRect = entry.intersectionRect;
    if (
      !state.loading &&
      entry.isIntersecting &&
      intersectionRect.bottom - boundingRect.bottom <= INTERSECTION_THRESHOLD
    ) {
      dispatch({ type: 'set', payload: { loading: true } });
      const data = await onGrabData(state.currentPage);
      dispatch({ type: 'onGrabData', payload: { data } });
    }
  }, [onGrabData, state.currentPage, state.loading]);

  useEffect(() => {
    if (triggerRef.current) {
      const container = triggerRef.current;
      const observer = new IntersectionObserver(
        entries => _handleEntry(entries[0]),
        options
      );
      
      observer.observe(container);

      return () => {
        observer.disconnect();
      };
    }
    return Object.assign(
      () => null,
      { displayName: 'useLazyLoad-useEffect-cleanup' }
    );
  }, [triggerRef, options, _handleEntry]);

  return state;
};

export default useLazyLoad;
