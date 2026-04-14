/// <reference types="cypress" />

import '../plugins/tailwind';

import DraggableGridItem from '../../components/modules/Draggable/DraggableGridItem';
import { GridContextProvider } from '../../components/modules/Draggable/GridContext';

export const buildItem = (id: string) => ({ id });

describe('DraggableGridItem', () => {
  it('renders', () => {
    const moveItem = cy.stub();
    cy.mount(
      <GridContextProvider items={[buildItem('a'), buildItem('b'), buildItem('c')]}>
        <DraggableGridItem onMoveItem={moveItem} item={{
          id: 'a',
          hidden: false,
          draggable: true,
        }}>
          <div className="border">a</div>
        </DraggableGridItem>
        <DraggableGridItem onMoveItem={moveItem} item={{
          id: 'b',
          hidden: false,
          draggable: true,
        }}>
          <div className="border" id="b">b</div>
        </DraggableGridItem>
        <DraggableGridItem onMoveItem={moveItem} item={{
          id: 'c',
          hidden: false,
          draggable: true,
        }}>
          <div className="border">c</div>
        </DraggableGridItem>
      </GridContextProvider>
    ).then(() => {
      cy.findByText('a').should('exist');
    });
  });
});