import { ProfileContext } from 'components/modules/Profile/ProfileContext';

import React, { PropsWithChildren, ReactElement, useContext, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { useDrag, useDrop } from 'react-dnd';

export type GridDragObject = {
  id: string; // NFT ID
  hidden: boolean;
  draggable: boolean;
};

type DraggableGridItemProps = {
  item: GridDragObject,
  onMoveItem: (fromId: string, toId: string) => void,
}

const DraggableGridItem = (props: PropsWithChildren<DraggableGridItemProps>) => {
  const ref = useRef(null);
  const dummyRef = useRef(null);

  const { editMode } = useContext(ProfileContext);

  const [{ isDragging }, connectDrag] = useDrag<GridDragObject, unknown, {isDragging : boolean}>(() => ({
    type: 'gridItem',
    item: props.item,
    canDrag: editMode && !isMobile && !props.item.hidden && props.item.draggable,
    collect: monitor => {
      return {
        isDragging: monitor.isDragging()
      };
    }
  }));

  const [{ isOver }, connectDrop] = useDrop<GridDragObject, unknown, { isOver: boolean }>(() => ({
    accept: 'gridItem',
    drop(item) {
      if (item.id !== props.item.id) {
        props.onMoveItem(item.id, props.item.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    })
  }));

  if (props.item.hidden) {
    connectDrag(dummyRef);
    connectDrop(dummyRef);
  } else {
    connectDrag(ref);
    connectDrop(ref);
  }

  const opacity = isDragging ? 0.8 : 1;
  const border = isOver ? '1px solid #ffffff' : 'none';
  const containerStyle = {
    opacity,
    border,
    borderRadius: '12px',
  };

  return <>
    {React.Children.map(props.children as ReactElement<any>, child =>
      React.cloneElement(child, {
        ref,
        style: containerStyle
      })
    )}
  </>;
};

export default React.memo(DraggableGridItem);