import { createContext, PropsWithChildren, useCallback, useRef } from 'react';

export type ScrollDirection = 'up' | 'down';

type ProfileScrollContextType = {
  scroll: (direction: ScrollDirection) => void;
  current: HTMLDivElement | null;
};

export const ProfileScrollContext = createContext<ProfileScrollContextType>({
  scroll: () => null,
  current: null,
});

export function ProfileScrollContextProvider(props: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);
  
  const scroll = useCallback((direction: ScrollDirection) => {
    if (direction === 'down') {
      ref.current.scrollTop += 15;
    } else {
      ref.current.scrollTop -= 15;
    }
  }, [ref]);

  return <ProfileScrollContext.Provider value={{
    scroll,
    current: ref.current,
  }}>
    <div ref={ref} className="w-full flex flex-col minlg:mt-20 overflow-y-auto overflow-x-hidden pb-20">
      {props.children}
    </div>
  </ProfileScrollContext.Provider>;
}