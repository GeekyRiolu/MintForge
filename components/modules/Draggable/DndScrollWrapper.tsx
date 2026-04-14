import { ProfileScrollContext } from 'components/modules/Profile/ProfileScrollContext';

import { GridDragObject } from './DraggableGridItem';

import { PropsWithChildren, useContext } from 'react';
import { useDrop } from 'react-dnd';

export function DndScrollWrapper(props: PropsWithChildren) {
  const { scroll, current } = useContext(ProfileScrollContext);

  const [, connectDrop] = useDrop<GridDragObject, unknown, null>(() => ({
    accept: 'gridItem',
    hover(item, monitor) {
      if (monitor.getClientOffset().y < 200) {
        scroll('up');
      } else if (monitor.getClientOffset().y > current.getBoundingClientRect().height - 200) {
        scroll('down');
      }
    },
  }));

  connectDrop(current);

  return <div className='h-full w-full'>
    {props.children}
  </div>;
}