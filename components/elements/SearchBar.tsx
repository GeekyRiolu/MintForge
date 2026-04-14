import { SearchContent } from 'components/modules/Search/SearchContent';

import ClientOnly from './ClientOnly';

interface SearchBarProps {
  leaderBoardSearch?: boolean;
}

export const SearchBar = (props: SearchBarProps) => {
  return (
    <ClientOnly>
      <SearchContent leaderBoardSearch={props.leaderBoardSearch} isHeader />
    </ClientOnly>
  );
};
